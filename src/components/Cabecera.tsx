"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { NEGOCIO } from "@/lib/negocio";
import { IconoCasa, IconoLista, IconoMovil } from "./Iconos";

const BOTON =
  "boton-3d flex w-full max-w-[9.5rem] items-center justify-center gap-2 rounded-xl px-3 py-2 text-base font-extrabold max-[359px]:gap-1.5 max-[359px]:px-2";

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
    <header className="sticky top-0 z-30 border-b border-marca-100 bg-white">
      <div className="mx-auto grid max-w-2xl grid-cols-2 items-center gap-3 px-4 pb-4 pt-3 sm:px-6">
        <a
          href={`tel:${NEGOCIO.telefonoHref}`}
          className={`${BOTON} justify-self-start`}
          aria-label={`Llamar al ${NEGOCIO.telefono}`}
        >
          <IconoMovil className="size-6 shrink-0" />
          Llamar
        </a>
        {enPortada ? (
          <Link href="/servicios" className={`${BOTON} justify-self-end`}>
            <IconoLista className="size-5 shrink-0" />
            Servicios
          </Link>
        ) : (
          <Link href="/" className={`${BOTON} justify-self-end`}>
            <IconoCasa className="size-5 shrink-0" />
            Inicio
          </Link>
        )}
      </div>
    </header>
  );
}
