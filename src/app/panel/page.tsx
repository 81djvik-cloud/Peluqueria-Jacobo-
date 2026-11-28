import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { haySesion } from "@/lib/auth";
import {
  ahoraMadrid,
  capitalizar,
  esFechaValida,
  fechaLarga,
  horaAMinutos,
  nombreDia,
  sumarDias,
} from "@/lib/horario";
import { reservasDelDia, type Reserva } from "@/lib/reservas";
import { formatPrecio } from "@/lib/servicios";
import { IconoFlecha, IconoFlechaIzq, IconoTelefono } from "@/components/Iconos";
import { AccionesReserva } from "./AccionesReserva";
import { AgendaSheets } from "./AgendaSheets";
import { Autorefresco } from "./Autorefresco";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default function PanelPage({ searchParams }: PageProps<"/panel">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-marca-100/60" />}>
      <Panel searchParams={searchParams} />
    </Suspense>
  );
}

type EstadoVisible = "pendiente" | "en-curso" | "atendida" | "cancelada";

function estadoVisible(r: Reserva, ahora: { fecha: string; minutos: number }): EstadoVisible {
  if (r.estado !== "pendiente") return r.estado;
  const ini = horaAMinutos(r.hora)!;
  if (r.fecha === ahora.fecha && ini <= ahora.minutos) return "en-curso";
  return "pendiente";
}

async function Panel({ searchParams }: Pick<PageProps<"/panel">, "searchParams">) {
  await connection(); // depende de la hora actual en Madrid
  if (!(await haySesion())) redirect("/panel/login");

  const params = await searchParams;
  const ahora = ahoraMadrid();
  const fecha =
    typeof params.fecha === "string" && esFechaValida(params.fecha) ? params.fecha : ahora.fecha;
  const reservas = await reservasDelDia(fecha);

  const activas = reservas.filter((r) => r.estado !== "cancelada");
  const atendidas = reservas.filter((r) => r.estado === "atendida");
  const pendientes = reservas.filter((r) => r.estado === "pendiente");
  const caja = atendidas.reduce((s, r) => s + r.precio, 0);
  const esHoy = fecha === ahora.fecha;

  return (
    <div className="space-y-8">
      <Autorefresco />
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-marca-700">Panel del negocio</p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {esHoy ? "Reservas de hoy" : "Reservas del día"}
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            {capitalizar(nombreDia(fecha))}, {fechaLarga(fecha)}
          </p>
        </div>
        <form action={logoutAction}>
          <button className="boton-3d-claro rounded-xl px-3 py-2 text-base font-semibold text-slate-600">
            Salir
          </button>
        </form>
      </header>

      <nav className="grid grid-cols-3 gap-2 pb-1" aria-label="Cambiar de día">
        <Link
          href={`/panel?fecha=${sumarDias(fecha, -1)}`}
          className="boton-3d-claro flex items-center justify-center gap-1 rounded-xl px-1 py-3 text-sm font-semibold sm:text-base"
        >
          <IconoFlechaIzq className="size-4" /> Anterior
        </Link>
        <Link
          href="/panel"
          aria-current={esHoy ? "page" : undefined}
          className={`flex items-center justify-center rounded-xl py-3 text-base font-bold ${
            esHoy ? "pulsado" : "boton-3d-claro"
          }`}
        >
          Hoy
        </Link>
        <Link
          href={`/panel?fecha=${sumarDias(fecha, 1)}`}
          className="boton-3d-claro flex items-center justify-center gap-1 rounded-xl px-1 py-3 text-sm font-semibold sm:text-base"
        >
          Siguiente <IconoFlecha className="size-4" />
        </Link>
      </nav>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dato etiqueta="Citas" valor={String(activas.length)} />
        <Dato etiqueta="Pendientes" valor={String(pendientes.length)} />
        <Dato etiqueta="Atendidas" valor={String(atendidas.length)} />
        <Dato etiqueta="Caja" valor={formatPrecio(caja)} />
      </dl>

      {reservas.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-lg text-slate-600 ring-1 ring-slate-200">
          No hay reservas para este día.
        </p>
      ) : (
        <ol className="space-y-4">
          {reservas.map((r) => (
            <TarjetaReserva key={r.id} r={r} estado={estadoVisible(r, ahora)} />
          ))}
        </ol>
      )}
      <p className="text-center text-sm text-slate-500">
        Las citas se marcan como atendidas automáticamente al terminar su hora prevista (hora de Madrid).
      </p>
      <AgendaSheets />
    </div>
  );
}

const ESTILOS: Record<EstadoVisible, { texto: string; clase: string; borde: string }> = {
  pendiente: { texto: "Pendiente", clase: "bg-marca-100 text-marca-800", borde: "border-l-marca-500" },
  "en-curso": { texto: "En curso", clase: "bg-amber-100 text-amber-800", borde: "border-l-amber-500" },
  atendida: { texto: "Atendida", clase: "bg-emerald-100 text-emerald-800", borde: "border-l-emerald-500" },
  cancelada: { texto: "Cancelada", clase: "bg-red-100 text-red-700", borde: "border-l-red-400" },
};

function TarjetaReserva({ r, estado }: { r: Reserva; estado: EstadoVisible }) {
  const e = ESTILOS[estado];
  const cancelada = estado === "cancelada";
  return (
    <li
      className={`space-y-4 rounded-2xl border-l-8 bg-white p-5 shadow-sm ring-1 ring-slate-200 ${e.borde} ${
        cancelada ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`whitespace-nowrap text-2xl font-extrabold tabular-nums ${cancelada ? "line-through" : ""}`}>
          {r.hora} <span className="text-lg font-semibold text-slate-400">– {r.horaFin}</span>
        </p>
        <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${e.clase}`}>
          {e.texto}
          {estado === "atendida" && r.atendidaAuto && <span className="font-medium"> · auto</span>}
        </span>
      </div>
      <div>
        <p className="text-xl font-bold">{r.nombre}</p>
        <p className="text-base text-slate-600">
          {r.servicioNombre} · {formatPrecio(r.precio)}
        </p>
        <a
          href={`tel:+34${r.telefono.replace(/\s/g, "")}`}
          className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-marca-700"
        >
          <IconoTelefono className="size-4" /> {r.telefono}
        </a>
      </div>
      {r.estado === "pendiente" && <AccionesReserva id={r.id} nombre={r.nombre} hora={r.hora} />}
    </li>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center ring-1 ring-slate-200">
      <dt className="text-sm font-semibold text-slate-500">{etiqueta}</dt>
      <dd className="mt-1 text-2xl font-extrabold tabular-nums">{valor}</dd>
    </div>
  );
}
