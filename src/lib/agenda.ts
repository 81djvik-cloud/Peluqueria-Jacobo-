import "server-only";
import { timingSafeEqual } from "node:crypto";
import { capitalizar, fechaCorta, nombreDia } from "./horario";
import type { Reserva } from "./reservas";
import { firmar } from "./seguridad";

/** Clave privada del enlace de la agenda (para Google Sheets). Cambia si cambia SESSION_SECRET. */
export function claveAgenda(): string {
  return firmar("agenda-google-sheets").slice(0, 40);
}

export function claveAgendaValida(clave: string | null): boolean {
  if (!clave) return false;
  const a = Buffer.from(clave);
  const b = Buffer.from(claveAgenda());
  return a.length === b.length && timingSafeEqual(a, b);
}

function campo(v: string | number): string {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV de las citas pendientes: una fila por cita. */
export function agendaCSV(citas: Reserva[]): string {
  const cabecera = ["Fecha", "Día", "Hora", "Fin", "Servicio", "Precio (€)", "Cliente", "Teléfono"];
  const filas = citas.map((r) => [
    fechaCorta(r.fecha),
    capitalizar(nombreDia(r.fecha)),
    r.hora,
    r.horaFin,
    r.servicioNombre,
    r.precio,
    r.nombre,
    r.telefono,
  ]);
  return [cabecera, ...filas].map((f) => f.map(campo).join(",")).join("\r\n") + "\r\n";
}
