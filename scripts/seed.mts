/**
 * Crea la tabla y carga reservas de ejemplo realistas.
 *   npm run db:seed            → solo si la tabla está vacía
 *   npm run db:seed -- --reset → borra todo y vuelve a cargar
 * Requiere DATABASE_URL (o POSTGRES_URL) en el entorno o en .env.local.
 */
import postgres from "postgres";
import { SCHEMA_SQL } from "../src/lib/schema.ts";
import { ahoraMadrid, diasReservables, horaAMinutos, minutosAHora, sumarDias, estaAbierto } from "../src/lib/horario.ts";
import { getServicio } from "../src/lib/servicios.ts";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("Falta DATABASE_URL. Ponla en .env.local o en el entorno.");
  process.exit(1);
}
const sql = postgres(url, { prepare: false, max: 1 });

const CLIENTES: [string, string][] = [
  ["Javier Martín", "612 345 678"],
  ["Lucas Fernández (niño)", "634 112 908"],
  ["Antonio García", "655 873 214"],
  ["Daniel Romero", "699 204 551"],
  ["Pablo Sánchez", "622 908 337"],
  ["Hugo López (niño)", "617 450 129"],
  ["Manuel Ruiz", "640 387 765"],
  ["Sergio Navarro", "678 015 442"],
  ["Álvaro Moreno", "611 762 083"],
  ["Carlos Jiménez", "687 330 916"],
  ["Mateo Díaz (niño)", "656 248 701"],
  ["Raúl Torres", "603 914 285"],
  ["Iván Castillo", "629 501 874"],
  ["Francisco Ortega", "691 476 320"],
];

// [hora, servicio] por día. Se van rotando clientes.
const AGENDA: [string, string][][] = [
  [
    ["09:00", "corte"], ["09:30", "corte-barba"], ["10:15", "maquina"], ["11:00", "lavado-corte"],
    ["12:00", "navaja"], ["13:15", "corte"], ["16:00", "corte-barba"], ["17:00", "corte"],
    ["17:45", "maquina"], ["18:30", "lavado-corte"], ["19:30", "navaja"], ["20:00", "corte"],
  ],
  [["09:15", "maquina"], ["10:00", "corte-barba"], ["12:30", "corte"], ["16:30", "navaja"], ["18:00", "corte"], ["19:15", "lavado-corte"]],
  [["09:45", "corte"], ["11:30", "lavado-corte"], ["13:00", "maquina"], ["17:15", "corte-barba"], ["19:00", "corte"]],
  [["10:30", "navaja"], ["12:15", "corte"], ["16:15", "maquina"], ["18:45", "corte-barba"]],
  [["09:00", "corte-barba"], ["11:45", "corte"], ["17:30", "lavado-corte"]],
];

async function main() {
  for (const q of SCHEMA_SQL) await sql.unsafe(q);

  if (process.argv.includes("--reset")) {
    await sql`TRUNCATE reservas`;
    console.log("Tabla vaciada.");
  } else {
    const [{ n }] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM reservas`;
    if (n > 0) {
      console.log(`La tabla ya tiene ${n} reservas. Usa --reset para recargar los datos de ejemplo.`);
      return;
    }
  }

  const ahora = ahoraMadrid();
  // Hoy (si abre) + los siguientes días abiertos.
  const dias = [ahora.fecha, ...diasReservables(ahora).filter((f) => f !== ahora.fecha)]
    .filter(estaAbierto)
    .slice(0, AGENDA.length);
  // Ayer (o el último día abierto) para que el panel tenga historial.
  let ayer = sumarDias(ahora.fecha, -1);
  while (!estaAbierto(ayer)) ayer = sumarDias(ayer, -1);

  let c = 0;
  let total = 0;
  const insertar = async (fecha: string, hora: string, servicioId: string, estado: string) => {
    const s = getServicio(servicioId)!;
    const ini = horaAMinutos(hora)!;
    const [nombre, tel] = CLIENTES[c++ % CLIENTES.length];
    await sql`
      INSERT INTO reservas (servicio_id, servicio_nombre, precio, duracion_min, inicio, fin,
                            cliente_nombre, cliente_telefono, estado, atendida_auto)
      VALUES (${s.id}, ${s.nombre}, ${s.precio}, ${s.duracion},
              ${`${fecha} ${hora}:00`}::timestamp,
              ${`${fecha} ${minutosAHora(ini + s.duracion)}:00`}::timestamp,
              ${nombre}, ${tel}, ${estado}, ${estado === "atendida"})
    `;
    total++;
  };

  for (const [hora, servicio] of AGENDA[0].slice(0, 7)) await insertar(ayer, hora, servicio, "atendida");

  for (let i = 0; i < dias.length; i++) {
    for (const [j, [hora, servicio]] of AGENDA[i].entries()) {
      // Una cita cancelada en el día de hoy, para ver ese estado en el panel.
      const estado = i === 0 && j === 3 ? "cancelada" : "pendiente";
      await insertar(dias[i], hora, servicio, estado);
    }
  }
  console.log(`Cargadas ${total} reservas de ejemplo (${[ayer, ...dias].join(", ")}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
