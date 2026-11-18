import { horaAMinutos, madridAUTC } from "./horario";
import { NEGOCIO } from "./negocio";
import type { Reserva } from "./reservas";

function utcICS(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapar(t: string): string {
  return t.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

function intervaloUTC(r: Reserva) {
  return {
    inicio: madridAUTC(r.fecha, horaAMinutos(r.hora)!),
    fin: madridAUTC(r.fecha, horaAMinutos(r.horaFin)!),
  };
}

export function generarICS(r: Reserva): string {
  const { inicio, fin } = intervaloUTC(r);
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peluqueria Jacobo//Reservas//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${r.id}@peluqueria-jacobo`,
    `DTSTAMP:${utcICS(new Date())}`,
    `DTSTART:${utcICS(inicio)}`,
    `DTEND:${utcICS(fin)}`,
    `SUMMARY:${escapar(`${r.servicioNombre} · ${NEGOCIO.nombre}`)}`,
    `LOCATION:${escapar(NEGOCIO.direccion)}`,
    `DESCRIPTION:${escapar(
      `Cita a nombre de ${r.nombre}.\nSi no puedes venir, llámanos al ${NEGOCIO.telefono}.`,
    )}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Cita en la peluquería",
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lineas.join("\r\n") + "\r\n";
}

export function enlaceGoogleCalendar(r: Reserva): string {
  const { inicio, fin } = intervaloUTC(r);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${r.servicioNombre} · ${NEGOCIO.nombre}`,
    dates: `${utcICS(inicio)}/${utcICS(fin)}`,
    details: `Cita a nombre de ${r.nombre}. Si no puedes venir, llámanos al ${NEGOCIO.telefono}.`,
    location: NEGOCIO.direccion,
    ctz: "Europe/Madrid",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}
