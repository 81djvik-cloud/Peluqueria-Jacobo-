import type { NextRequest } from "next/server";
import { agendaCSV, claveAgendaValida } from "@/lib/agenda";
import { haySesion } from "@/lib/auth";
import { citasPendientes } from "@/lib/reservas";

/**
 * GET /api/agenda?clave=…  → CSV con las citas pendientes (para Google Sheets: IMPORTDATA).
 * GET /api/agenda?descargar=1 con sesión del panel → descarga del mismo CSV.
 */
export async function GET(req: NextRequest) {
  const clave = req.nextUrl.searchParams.get("clave");
  const autorizado = claveAgendaValida(clave) || (await haySesion());
  if (!autorizado) {
    return new Response("No autorizado", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const csv = agendaCSV(await citasPendientes());
  const descargar = req.nextUrl.searchParams.get("descargar") === "1";
  return new Response(descargar ? "﻿" + csv : csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
      ...(descargar
        ? { "Content-Disposition": 'attachment; filename="agenda-peluqueria-jacobo.csv"' }
        : {}),
    },
  });
}
