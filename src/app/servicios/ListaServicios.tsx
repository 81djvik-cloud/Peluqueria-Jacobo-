"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconoFlecha } from "@/components/Iconos";
import { SERVICIOS, formatPrecio } from "@/lib/servicios";

const MARGEN_INFERIOR_PX = 16; // aire bajo el botón «Reservar cita»

/**
 * Lista de servicios con tarjetas de la misma altura. El contenedor se ajusta
 * a un número entero de tarjetas según el alto de la pantalla y el
 * desplazamiento se detiene siempre en tarjetas completas (scroll-snap).
 */
export function ListaServicios() {
  const refLista = useRef<HTMLUListElement>(null);
  const refPie = useRef<HTMLDivElement>(null);
  const [alto, setAlto] = useState<number | null>(null);
  const [hayMas, setHayMas] = useState(false);

  useEffect(() => {
    const lista = refLista.current;
    const pie = refPie.current;
    if (!lista || !pie) return;

    const calcular = () => {
      const tarjeta = lista.querySelector("li");
      if (!tarjeta) return;
      const altoTarjeta = tarjeta.getBoundingClientRect().height;
      const hueco = parseFloat(getComputedStyle(lista).rowGap) || 0;
      const arriba = lista.getBoundingClientRect().top + window.scrollY;
      const disponible =
        window.innerHeight - arriba - pie.getBoundingClientRect().height - MARGEN_INFERIOR_PX;
      const caben = Math.floor((disponible + hueco) / (altoTarjeta + hueco));
      const n = Math.min(SERVICIOS.length, Math.max(2, caben));
      setAlto(n >= SERVICIOS.length ? null : n * altoTarjeta + (n - 1) * hueco);
      setHayMas(n < SERVICIOS.length && lista.scrollTop + lista.clientHeight < lista.scrollHeight - 2);
    };

    calcular();
    const ro = new ResizeObserver(calcular);
    ro.observe(document.documentElement);
    window.addEventListener("resize", calcular);
    const alDesplazar = () =>
      setHayMas(lista.scrollTop + lista.clientHeight < lista.scrollHeight - 2);
    lista.addEventListener("scroll", alDesplazar, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calcular);
      lista.removeEventListener("scroll", alDesplazar);
    };
  }, []);

  return (
    <>
      <ul
        ref={refLista}
        style={alto ? { height: alto } : undefined}
        className={`sin-scrollbar -mx-1 flex flex-col gap-4 px-1 ${
          alto ? "snap-y snap-mandatory overflow-y-auto overscroll-contain" : ""
        }`}
      >
        {SERVICIOS.map((s) => (
          <li key={s.id} className="h-[5.5rem] shrink-0 snap-start pb-1">
            <Link
              href={`/reservar?servicio=${s.id}`}
              className="boton-3d-claro group flex h-full items-center justify-between gap-3 rounded-2xl px-5"
            >
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold">{s.nombre}</h2>
                <p className="truncate text-base text-slate-600">{s.descripcion}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-2xl font-extrabold">{formatPrecio(s.precio)}</span>
                <IconoFlecha className="size-5 text-marca-400" />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div ref={refPie} className="pt-3">
        <p
          aria-hidden={!hayMas}
          className={`mb-3 text-center text-sm font-semibold text-marca-600 transition-opacity ${
            hayMas ? "opacity-100" : "opacity-0"
          }`}
        >
          Desliza para ver más ↓
        </p>
        <Link
          href="/reservar"
          className="boton-3d flex w-full items-center justify-center rounded-2xl px-6 py-5 text-xl font-bold"
        >
          Reservar cita
        </Link>
      </div>
    </>
  );
}
