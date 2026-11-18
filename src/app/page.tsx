import Link from "next/link";
import { NEGOCIO } from "@/lib/negocio";
import { SERVICIOS, formatPrecio } from "@/lib/servicios";
import { IconoCalendario, IconoReloj, IconoTijeras } from "@/components/Iconos";

export default function Inicio() {
  const desde = SERVICIOS[0].precio;
  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-br from-marca-100 via-marca-50 to-white px-6 py-12 text-center shadow-sm ring-1 ring-marca-100 sm:px-10">
        <span className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-marca-500 text-white shadow-md">
          <IconoTijeras className="size-8" />
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          {NEGOCIO.nombre}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-xl leading-relaxed text-slate-700">
          {NEGOCIO.lema}
        </p>
        <Link
          href="/reservar"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-marca-600 px-6 py-5 text-xl font-bold text-white shadow-lg shadow-marca-600/25 transition hover:bg-marca-700 active:scale-[0.98] sm:mx-auto sm:max-w-sm"
        >
          <IconoCalendario className="size-6" />
          Reservar cita
        </Link>
        <p className="mt-4 text-base text-slate-600">Sin registros. Te lleva menos de un minuto.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <IconoTijeras className="mb-3 size-7 text-marca-600" />
          <h2 className="text-lg font-bold">Hombre y niño</h2>
          <p className="mt-1 text-slate-600">
            Cortes desde {formatPrecio(desde)}.{" "}
            <Link href="/servicios" className="font-semibold text-marca-700 underline-offset-2 hover:underline">
              Ver servicios
            </Link>
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <IconoReloj className="mb-3 size-7 text-marca-600" />
          <h2 className="text-lg font-bold">Horario</h2>
          <ul className="mt-1 space-y-1 text-slate-600">
            {NEGOCIO.horarioTexto.map((h) => (
              <li key={h.dias}>
                <span className="font-semibold text-slate-800">{h.dias}:</span> {h.horas}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
