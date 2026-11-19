import Link from "next/link";
import { NEGOCIO } from "@/lib/negocio";

export function Pie() {
  return (
    <footer className="border-t border-marca-100 bg-white">
      <div className="mx-auto max-w-2xl px-5 py-8 text-base text-slate-600 sm:px-6">
        <p className="font-bold text-slate-800">{NEGOCIO.nombre}</p>
        <p className="mt-12 border-t border-slate-100 pt-6 text-sm">
          <Link href="/panel" className="text-slate-500 underline-offset-2 hover:underline">
            Acceso del negocio
          </Link>
        </p>
      </div>
    </footer>
  );
}
