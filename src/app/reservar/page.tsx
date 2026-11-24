import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ahoraMadrid,
  diaDelMes,
  diasReservables,
  etiquetaDia,
  mesCorto,
} from "@/lib/horario";
import { getServicio } from "@/lib/servicios";
import { ReservaForm, type DiaOpcion } from "./ReservaForm";

export const metadata: Metadata = { title: "Reservar cita" };

export default function ReservarPage({ searchParams }: PageProps<"/reservar">) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Reservar cita</h1>
        <p className="mt-2 text-lg text-slate-600">Elige servicio, día y hora.</p>
        <p className="text-lg text-slate-600">Solo verás horas libres.</p>
      </header>
      <Suspense fallback={<Cargando />}>
        <Formulario searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Formulario({ searchParams }: Pick<PageProps<"/reservar">, "searchParams">) {
  await connection(); // los días dependen de la hora actual en Madrid
  const params = await searchParams;
  const ahora = ahoraMadrid();
  const dias: DiaOpcion[] = diasReservables(ahora).map((fecha) => ({
    fecha,
    etiqueta: etiquetaDia(fecha, ahora.fecha),
    dia: diaDelMes(fecha),
    mes: mesCorto(fecha),
  }));
  const servicioId = typeof params.servicio === "string" ? params.servicio : undefined;
  return <ReservaForm dias={dias} servicioInicial={getServicio(servicioId)?.id ?? null} />;
}

function Cargando() {
  return (
    <div className="space-y-4" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-marca-100/60" />
      ))}
    </div>
  );
}
