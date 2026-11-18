import { generarICS } from "@/lib/calendario";
import { obtenerReserva } from "@/lib/reservas";

/** Descarga la cita como archivo .ics (iPhone, Android, Outlook…). */
export async function GET(_req: Request, ctx: RouteContext<"/api/reservas/[id]/calendario">) {
  const { id } = await ctx.params;
  const reserva = await obtenerReserva(id);
  if (!reserva) return new Response("Reserva no encontrada", { status: 404 });
  return new Response(generarICS(reserva), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="cita-peluqueria-jacobo-${reserva.fecha}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
