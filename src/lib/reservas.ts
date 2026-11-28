import "server-only";
import { db } from "./db";
import { horaAMinutos, minutosAHora, type Ocupado } from "./horario";
import { MAX_CITAS_POR_TELEFONO, MAX_RESERVAS_POR_CONEXION_HORA } from "./seguridad";
import type { Servicio } from "./servicios";

export type EstadoReserva = "pendiente" | "atendida" | "cancelada";

export type Reserva = {
  id: string;
  servicioId: string;
  servicioNombre: string;
  precio: number;
  duracion: number;
  fecha: string; // YYYY-MM-DD (Madrid)
  hora: string; // HH:MM (Madrid)
  horaFin: string; // HH:MM (Madrid)
  nombre: string;
  telefono: string;
  estado: EstadoReserva;
  atendidaAuto: boolean;
};

type Fila = {
  id: string;
  servicio_id: string;
  servicio_nombre: string;
  precio: string;
  duracion_min: number;
  fecha: string;
  hora: string;
  hora_fin: string;
  cliente_nombre: string;
  cliente_telefono: string;
  estado: EstadoReserva;
  atendida_auto: boolean;
};

function aReserva(f: Fila): Reserva {
  return {
    id: f.id,
    servicioId: f.servicio_id,
    servicioNombre: f.servicio_nombre,
    precio: Number(f.precio),
    duracion: f.duracion_min,
    fecha: f.fecha,
    hora: f.hora,
    horaFin: f.hora_fin,
    nombre: f.cliente_nombre,
    telefono: f.cliente_telefono,
    estado: f.estado,
    atendidaAuto: f.atendida_auto,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Intervalos ocupados (reservas no canceladas) de un día. */
export async function ocupadosDelDia(fecha: string): Promise<Ocupado[]> {
  const sql = await db();
  const filas = await sql<{ hora: string; hora_fin: string }[]>`
    SELECT to_char(inicio, 'HH24:MI') AS hora, to_char(fin, 'HH24:MI') AS hora_fin
    FROM reservas
    WHERE inicio >= ${fecha}::date AND inicio < ${fecha}::date + 1
      AND estado <> 'cancelada'
  `;
  return filas.map((f) => ({ inicio: horaAMinutos(f.hora)!, fin: horaAMinutos(f.hora_fin)! }));
}

export class HoraOcupadaError extends Error {}
/** El teléfono ya tiene el máximo de citas pendientes. */
export class LimiteTelefonoError extends Error {}
/** Demasiadas reservas desde la misma conexión en la última hora. */
export class LimiteConexionError extends Error {}

export async function crearReserva(datos: {
  servicio: Servicio;
  fecha: string;
  minutos: number;
  nombre: string;
  telefono: string;
  origen: string;
}): Promise<string> {
  const sql = await db();
  const inicio = `${datos.fecha} ${minutosAHora(datos.minutos)}:00`;
  const fin = `${datos.fecha} ${minutosAHora(datos.minutos + datos.servicio.duracion)}:00`;
  try {
    return await sql.begin(async (tx) => {
      // Serializa las reservas del mismo teléfono y de la misma conexión para
      // que dos envíos simultáneos no se salten los límites.
      await tx`SELECT pg_advisory_xact_lock(hashtext(${"tel:" + datos.telefono}))`;
      await tx`SELECT pg_advisory_xact_lock(hashtext(${"org:" + datos.origen}))`;

      const [{ pendientes }] = await tx<{ pendientes: number }[]>`
        SELECT count(*)::int AS pendientes FROM reservas
        WHERE cliente_telefono = ${datos.telefono}
          AND estado = 'pendiente'
          AND fin > (now() AT TIME ZONE 'Europe/Madrid')
      `;
      if (pendientes >= MAX_CITAS_POR_TELEFONO) throw new LimiteTelefonoError();

      const [{ recientes }] = await tx<{ recientes: number }[]>`
        SELECT count(*)::int AS recientes FROM reservas
        WHERE origen = ${datos.origen} AND creada_en > now() - interval '1 hour'
      `;
      if (recientes >= MAX_RESERVAS_POR_CONEXION_HORA) throw new LimiteConexionError();

      const [fila] = await tx<{ id: string }[]>`
        INSERT INTO reservas
          (servicio_id, servicio_nombre, precio, duracion_min, inicio, fin,
           cliente_nombre, cliente_telefono, origen)
        VALUES
          (${datos.servicio.id}, ${datos.servicio.nombre}, ${datos.servicio.precio},
           ${datos.servicio.duracion}, ${inicio}::timestamp, ${fin}::timestamp,
           ${datos.nombre}, ${datos.telefono}, ${datos.origen})
        RETURNING id
      `;
      return fila.id;
    });
  } catch (e) {
    // 23P01 = exclusion_violation: otra reserva ocupa ya ese hueco.
    if ((e as { code?: string }).code === "23P01") throw new HoraOcupadaError();
    throw e;
  }
}

const COLUMNAS = `
  id, servicio_id, servicio_nombre, precio, duracion_min,
  to_char(inicio, 'YYYY-MM-DD') AS fecha,
  to_char(inicio, 'HH24:MI') AS hora,
  to_char(fin, 'HH24:MI') AS hora_fin,
  cliente_nombre, cliente_telefono, estado, atendida_auto
`;

export async function obtenerReserva(id: string): Promise<Reserva | null> {
  if (!UUID_RE.test(id)) return null;
  const sql = await db();
  const [fila] = await sql<Fila[]>`SELECT ${sql.unsafe(COLUMNAS)} FROM reservas WHERE id = ${id}`;
  return fila ? aReserva(fila) : null;
}

/**
 * Marca como atendidas las citas cuya hora de fin (inicio + duración) ya ha
 * pasado según la hora actual de Madrid y que no se han cancelado.
 */
export async function autoMarcarAtendidas(): Promise<void> {
  const sql = await db();
  await sql`
    UPDATE reservas
    SET estado = 'atendida', atendida_auto = true, actualizada_en = now()
    WHERE estado = 'pendiente'
      AND fin <= (now() AT TIME ZONE 'Europe/Madrid')
  `;
  // Privacidad (RGPD): las citas se conservan solo MESES_CONSERVACION meses.
  await sql`
    DELETE FROM reservas
    WHERE fin < (now() AT TIME ZONE 'Europe/Madrid') - make_interval(months => ${MESES_CONSERVACION})
  `;
  await sql`DELETE FROM intentos_acceso WHERE actualizado < now() - interval '1 day'`;
}

/** Meses que se guardan las citas antes de borrarse automáticamente. */
export const MESES_CONSERVACION = 3;

/** Reservas de un día ordenadas por hora. */
export async function reservasDelDia(fecha: string): Promise<Reserva[]> {
  await autoMarcarAtendidas();
  const sql = await db();
  const filas = await sql<Fila[]>`
    SELECT ${sql.unsafe(COLUMNAS)}
    FROM reservas
    WHERE inicio >= ${fecha}::date AND inicio < ${fecha}::date + 1
    ORDER BY inicio, creada_en
  `;
  return filas.map(aReserva);
}

export async function cambiarEstado(id: string, estado: "atendida" | "cancelada"): Promise<void> {
  if (!UUID_RE.test(id)) return;
  const sql = await db();
  await sql`
    UPDATE reservas
    SET estado = ${estado}, atendida_auto = false, actualizada_en = now()
    WHERE id = ${id} AND estado = 'pendiente'
  `;
}

/** Citas pendientes (aún no han terminado), ordenadas por fecha y hora. */
export async function citasPendientes(): Promise<Reserva[]> {
  await autoMarcarAtendidas();
  const sql = await db();
  const filas = await sql<Fila[]>`
    SELECT ${sql.unsafe(COLUMNAS)}
    FROM reservas
    WHERE estado = 'pendiente' AND fin > (now() AT TIME ZONE 'Europe/Madrid')
    ORDER BY inicio
  `;
  return filas.map(aReserva);
}
