"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { AccesoNegocio } from "./AccesoNegocio";

/** Enlaces discretos: «Privacidad» y «Acceso del negocio» (pulsación de 2 s). */
export function EnlacesPie() {
  return (
    <div className="flex items-center justify-between gap-4">
      <Link href="/privacidad" className="py-1 text-sm text-slate-500 underline-offset-2 hover:underline">
        Privacidad
      </Link>
      <AccesoNegocio />
    </div>
  );
}

function PieSegunRuta() {
  // En la portada los enlaces van dentro de la tercera pantalla.
  if (usePathname() === "/") return null;
  return <PieBase />;
}

function PieBase() {
  return (
    <footer className="mt-10 border-t border-marca-100 bg-white">
      <div className="mx-auto max-w-2xl px-5 py-8 sm:px-6">
        <EnlacesPie />
      </div>
    </footer>
  );
}

export function Pie() {
  return (
    <Suspense fallback={<PieBase />}>
      <PieSegunRuta />
    </Suspense>
  );
}
