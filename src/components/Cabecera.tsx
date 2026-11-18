import Link from "next/link";
import { NEGOCIO } from "@/lib/negocio";
import { IconoTijeras } from "./Iconos";

export function Cabecera() {
  return (
    <header className="sticky top-0 z-20 border-b border-marca-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-extrabold text-slate-900">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-marca-500 text-white">
            <IconoTijeras className="size-5" />
          </span>
          <span className="text-base leading-tight sm:text-lg">{NEGOCIO.nombre}</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 text-base font-semibold">
          <Link
            href="/servicios"
            className="rounded-lg px-2.5 py-2 text-slate-700 max-[359px]:hidden hover:bg-marca-50 hover:text-marca-700"
          >
            Servicios
          </Link>
          <Link
            href="/reservar"
            className="rounded-lg bg-marca-600 px-3 py-2 text-white hover:bg-marca-700"
          >
            Reservar
          </Link>
        </nav>
      </div>
    </header>
  );
}
