"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { NEGOCIO } from "@/lib/negocio";
import { IconoCasa, IconoLista, IconoTelefono } from "./Iconos";

const BOTON =
  "boton-3d flex shrink-0 items-center gap-2 rounded-xl py-2 pl-2.5 pr-3.5 text-base font-extrabold";

export function Cabecera() {
  // La ruta se conoce al pedir la página; mientras, se muestra «Inicio»,
  // que es lo correcto en todas las páginas salvo la portada.
  return (
    <Suspense fallback={<Barra enPortada={false} />}>
      <CabeceraSegunRuta />
    </Suspense>
  );
}

function CabeceraSegunRuta() {
  return <Barra enPortada={usePathname() === "/"} />;
}

function Barra({ enPortada }: { enPortada: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-marca-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 pb-4 pt-3 sm:px-6">
        {enPortada ? (
          <Link href="/servicios" className={BOTON}>
            <IconoLista className="size-5" />
            Servicios
          </Link>
        ) : (
          <Link href="/" className={BOTON}>
            <IconoCasa className="size-5" />
            Inicio
          </Link>
        )}
        <a href={`tel:${NEGOCIO.telefonoHref}`} className={BOTON} aria-label={`Llamar al ${NEGOCIO.telefono}`}>
          <IconoTelefono className="size-5" />
          Llamar
        </a>
      </div>
    </header>
  );
}
