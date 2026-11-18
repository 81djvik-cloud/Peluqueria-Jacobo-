import type { Metadata } from "next";
import Link from "next/link";
import { SERVICIOS, formatPrecio } from "@/lib/servicios";
import { IconoFlecha } from "@/components/Iconos";

export const metadata: Metadata = { title: "Servicios" };

export default function Servicios() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Servicios</h1>
        <p className="mt-2 text-lg text-slate-600">Precios con IVA incluido.</p>
      </header>

      <ul className="space-y-4">
        {SERVICIOS.map((s) => (
          <li key={s.id}>
            <Link
              href={`/reservar?servicio=${s.id}`}
              className="group flex items-center justify-between gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:ring-2 hover:ring-marca-400"
            >
              <div>
                <h2 className="text-xl font-bold">{s.nombre}</h2>
                <p className="mt-1 text-base text-slate-600">{s.descripcion}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-2xl font-extrabold text-marca-700">{formatPrecio(s.precio)}</span>
                <IconoFlecha className="size-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-marca-600" />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/reservar"
        className="flex w-full items-center justify-center rounded-2xl bg-marca-600 px-6 py-5 text-xl font-bold text-white shadow-lg shadow-marca-600/25 transition hover:bg-marca-700 active:scale-[0.98]"
      >
        Reservar cita
      </Link>
    </div>
  );
}
