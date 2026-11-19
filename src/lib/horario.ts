/**
 * Toda la lógica de fechas trabaja en la zona horaria Europe/Madrid.
 * Las fechas se representan como cadenas "YYYY-MM-DD" y las horas como
 * minutos desde medianoche (hora local de Madrid), así evitamos depender
 * de la zona horaria del servidor (Vercel corre en UTC).
 */
export const ZONA = "Europe/Madrid";
export const INTERVALO_MIN = 15;
export const DIAS_RESERVABLES = 14;

type Franja = readonly [number, number];
const h = (horas: number, minutos = 0) => horas * 60 + minutos;

/** Franjas de apertura (minutos desde medianoche, [inicio, fin)) por día de la semana. */
const LABORABLE: Franja[] = [
  [h(9, 30), h(14)], // 09:30 – 14:00
  [h(16, 30), h(20, 30)], // 16:30 – 20:30
];
const SABADO: Franja[] = [[h(9), h(14, 30)]]; // 09:00 – 14:30

/** Índice 0 = domingo … 6 = sábado. */
export const HORARIO_SEMANAL: ReadonlyArray<ReadonlyArray<Franja>> = [
  [], // domingo: cerrado
  LABORABLE, // lunes
  LABORABLE, // martes
  LABORABLE, // miércoles
  LABORABLE, // jueves
  LABORABLE, // viernes
  SABADO, // sábado
];

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export type AhoraMadrid = { fecha: string; minutos: number };

/** Fecha y hora actuales en Madrid. */
export function ahoraMadrid(now: Date = new Date()): AhoraMadrid {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: ZONA,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return {
    fecha: `${partes.year}-${partes.month}-${partes.day}`,
    minutos: Number(partes.hour) * 60 + Number(partes.minute),
  };
}

export function esFechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [y, m, d] = fecha.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function aUTC(fecha: string): Date {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function sumarDias(fecha: string, dias: number): string {
  const dt = aUTC(fecha);
  dt.setUTCDate(dt.getUTCDate() + dias);
  return dt.toISOString().slice(0, 10);
}

export function diaSemana(fecha: string): number {
  return aUTC(fecha).getUTCDay();
}

export function franjasDelDia(fecha: string): ReadonlyArray<Franja> {
  return HORARIO_SEMANAL[diaSemana(fecha)];
}

export function estaAbierto(fecha: string): boolean {
  return franjasDelDia(fecha).length > 0;
}

export function nombreDia(fecha: string): string {
  return DIAS[diaSemana(fecha)];
}

export function nombreDiaCorto(fecha: string): string {
  return DIAS_CORTOS[diaSemana(fecha)];
}

export function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "20 de noviembre de 2026" */
export function fechaLarga(fecha: string): string {
  const [y, m, d] = fecha.split("-").map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

/** "20/11/2026" */
export function fechaCorta(fecha: string): string {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

export function diaDelMes(fecha: string): number {
  return Number(fecha.slice(8, 10));
}

export function mesCorto(fecha: string): string {
  return MESES[Number(fecha.slice(5, 7)) - 1].slice(0, 3);
}

export function minutosAHora(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

export function horaAMinutos(hora: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hora);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** Horas de inicio posibles un día para un servicio de `duracion` minutos (debe acabar dentro de la franja). */
export function horasPosibles(fecha: string, duracion: number): number[] {
  const horas: number[] = [];
  for (const [ini, fin] of franjasDelDia(fecha)) {
    for (let t = ini; t + duracion <= fin; t += INTERVALO_MIN) horas.push(t);
  }
  return horas;
}

export type Ocupado = { inicio: number; fin: number };

/** Horas libres de un día para un servicio, excluyendo las ya pasadas. */
export function horasLibres(
  fecha: string,
  duracion: number,
  ocupados: Ocupado[],
  ahora: AhoraMadrid = ahoraMadrid(),
): number[] {
  if (!estaAbierto(fecha) || fecha < ahora.fecha) return [];
  return horasPosibles(fecha, duracion).filter((t) => {
    if (fecha === ahora.fecha && t <= ahora.minutos) return false;
    return !ocupados.some((o) => t < o.fin && o.inicio < t + duracion);
  });
}

/** Días en los que se puede reservar (abiertos) desde hoy. */
export function diasReservables(ahora: AhoraMadrid = ahoraMadrid()): string[] {
  const dias: string[] = [];
  for (let i = 0; i < DIAS_RESERVABLES; i++) {
    const f = sumarDias(ahora.fecha, i);
    if (!estaAbierto(f)) continue;
    // Hoy solo cuenta si aún queda alguna hora por delante.
    if (i === 0 && !horasPosibles(f, INTERVALO_MIN).some((t) => t > ahora.minutos)) continue;
    dias.push(f);
  }
  return dias;
}

export function esDiaReservable(fecha: string, ahora: AhoraMadrid = ahoraMadrid()): boolean {
  return esFechaValida(fecha) && diasReservables(ahora).includes(fecha);
}

/** Convierte una hora local de Madrid a un instante UTC (para el .ics). */
export function madridAUTC(fecha: string, minutos: number): Date {
  const [y, m, d] = fecha.split("-").map(Number);
  const supuesto = Date.UTC(y, m - 1, d, Math.floor(minutos / 60), minutos % 60);
  const offset = (t: number) => {
    const a = ahoraMadrid(new Date(t));
    const local = Date.UTC(
      Number(a.fecha.slice(0, 4)),
      Number(a.fecha.slice(5, 7)) - 1,
      Number(a.fecha.slice(8, 10)),
      Math.floor(a.minutos / 60),
      a.minutos % 60,
    );
    return local - t;
  };
  let utc = supuesto - offset(supuesto);
  utc = supuesto - offset(utc);
  return new Date(utc);
}

/** Etiqueta amistosa para el selector de días: "Hoy", "Mañana" o "Jue". */
export function etiquetaDia(fecha: string, hoy: string): string {
  if (fecha === hoy) return "Hoy";
  if (fecha === sumarDias(hoy, 1)) return "Mañana";
  return nombreDiaCorto(fecha);
}
