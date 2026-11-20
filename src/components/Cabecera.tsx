import Link from "next/link";
import { NEGOCIO } from "@/lib/negocio";
import { IconoLista, IconoTijeras } from "./Iconos";

export function Cabecera() {
  return (
    <header className="sticky top-0 z-20 border-b border-marca-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-extrabold text-slate-900">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-marca-500 text-white">
            <IconoTijeras className="size-5" />
          </span>
          <span className="text-base leading-tight sm:text-lg">{NEGOCIO.nombre}</span>
        </Link>
        <Link
          href="/servicios"
          className="flex shrink-0 items-center gap-2 rounded-xl py-1 pl-1 pr-2 font-extrabold text-slate-900 hover:bg-marca-50"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-marca-500 text-white">
            <IconoLista className="size-5" />
          </span>
          <span className="text-base sm:text-lg">Servicios</span>
        </Link>
      </div>
    </header>
  );
}
