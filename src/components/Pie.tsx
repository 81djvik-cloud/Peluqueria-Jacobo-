import Link from "next/link";
import { NEGOCIO } from "@/lib/negocio";

export function Pie() {
  return (
    <footer className="border-t border-marca-100 bg-white">
      <div className="mx-auto max-w-2xl space-y-1 px-5 py-8 text-base text-slate-600 sm:px-6">
        <p className="font-bold text-slate-800">{NEGOCIO.nombre}</p>
        <p>{NEGOCIO.direccion}</p>
        <p>
          Tel.{" "}
          <a href={`tel:${NEGOCIO.telefonoHref}`} className="font-semibold text-marca-700">
            {NEGOCIO.telefono}
          </a>
        </p>
        <p className="pt-3 text-sm">
          <Link href="/panel" className="underline-offset-2 hover:underline">
            Acceso del negocio
          </Link>
        </p>
      </div>
    </footer>
  );
}
