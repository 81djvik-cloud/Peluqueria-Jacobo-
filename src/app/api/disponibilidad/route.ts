import { NextResponse, type NextRequest } from "next/server";
import { ahoraMadrid, esDiaReservable, horasLibres, minutosAHora } from "@/lib/horario";
import { ocupadosDelDia } from "@/lib/reservas";
import { getServicio } from "@/lib/servicios";

/** GET /api/disponibilidad?fecha=YYYY-MM-DD&servicio=id → horas libres. */
export async function GET(req: NextRequest) {
  const fecha = req.nextUrl.searchParams.get("fecha") ?? "";
  const servicio = getServicio(req.nextUrl.searchParams.get("servicio"));
  if (!servicio) {
    return NextResponse.json({ error: "Servicio no válido." }, { status: 400 });
  }
  const ahora = ahoraMadrid();
  if (!esDiaReservable(fecha, ahora)) {
    return NextResponse.json({ fecha, horas: [] }, { headers: { "Cache-Control": "no-store" } });
  }
  const ocupados = await ocupadosDelDia(fecha);
  const horas = horasLibres(fecha, servicio.duracion, ocupados, ahora).map(minutosAHora);
  return NextResponse.json({ fecha, horas }, { headers: { "Cache-Control": "no-store" } });
}
