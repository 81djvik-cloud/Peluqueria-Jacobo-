import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { enlaceGoogleCalendar } from "@/lib/calendario";
import { capitalizar, fechaLarga, nombreDia } from "@/lib/horario";
import { NEGOCIO } from "@/lib/negocio";
import { obtenerReserva } from "@/lib/reservas";
import { formatPrecio } from "@/lib/servicios";
import { IconoCalendario, IconoCheck } from "@/components/Iconos";

export const metadata: Metadata = {
  title: "Cita confirmada",
  robots: { index: false, follow: false },
};

export default function ReservaPage({ params }: PageProps<"/reserva/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-marca-100/60" />}>
      <Resumen params={params} />
    </Suspense>
  );
}

async function Resumen({ params }: Pick<PageProps<"/reserva/[id]">, "params">) {
  const { id } = await params;
  const r = await obtenerReserva(id);
  if (!r) notFound();
  const cancelada = r.estado === "cancelada";

  return (
    <div className="space-y-8">
      <header className="text-center">
        <span
          className={`mx-auto mb-5 grid size-16 place-items-center rounded-full ${
            cancelada ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
          }`}
        >
          <IconoCheck className="size-8" />
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {cancelada ? "Cita cancelada" : "¡Cita confirmada!"}
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          {cancelada ? "Esta cita fue cancelada por la peluquería." : `Te esperamos, ${r.nombre.split(" ")[0]}.`}
        </p>
      </header>

      <dl className="divide-y divide-slate-100 rounded-3xl bg-white px-6 ring-1 ring-slate-200">
        <Fila etiqueta="Día" valor={capitalizar(nombreDia(r.fecha))} destacado />
        <Fila etiqueta="Fecha" valor={fechaLarga(r.fecha)} destacado />
        <Fila etiqueta="Hora" valor={`${r.hora} h`} destacado />
        <Fila etiqueta="Servicio" valor={r.servicioNombre} />
        <Fila etiqueta="Precio" valor={formatPrecio(r.precio)} />
        <Fila etiqueta="A nombre de" valor={r.nombre} />
        <Fila etiqueta="Teléfono" valor={r.telefono} />
      </dl>

      {!cancelada && (
        <div className="space-y-4">
          <a
            href={`/api/reservas/${r.id}/calendario`}
            className="boton-3d flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-5 text-xl font-bold"
          >
            <IconoCalendario className="size-6" />
            Añadir al calendario
          </a>
          <a
            href={enlaceGoogleCalendar(r)}
            target="_blank"
            rel="noopener noreferrer"
            className="boton-3d-claro flex w-full items-center justify-center rounded-2xl px-6 py-4 text-lg font-bold text-marca-700"
          >
            Usar Google Calendar
          </a>
        </div>
      )}

      <p className="text-center text-base text-slate-600">
        ¿No puedes venir? Llámanos al{" "}
        <a href={`tel:${NEGOCIO.telefonoHref}`} className="font-bold text-marca-700">
          {NEGOCIO.telefono}
        </a>
        .
      </p>
      <p className="text-center">
        <Link href="/" className="text-lg font-semibold text-marca-700 underline-offset-4 hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}

function Fila({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-4">
      <dt className="text-base text-slate-500">{etiqueta}</dt>
      <dd className={`text-right ${destacado ? "text-xl font-extrabold text-marca-700" : "text-lg font-semibold text-marca-700"}`}>
        {valor}
      </dd>
    </div>
  );
}
