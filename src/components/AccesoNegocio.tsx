"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const DURACION_MS = 2000;

/**
 * Acceso discreto al panel: hay que mantener pulsado el texto 2 segundos.
 * Un toque normal no hace nada. La seguridad real sigue siendo la contraseña.
 */
export function AccesoNegocio() {
  const router = useRouter();
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pulsando, setPulsando] = useState(false);

  const empezar = () => {
    setPulsando(true);
    temporizador.current = setTimeout(() => {
      setPulsando(false);
      router.push("/panel");
    }, DURACION_MS);
  };

  const cancelar = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
    setPulsando(false);
  };

  return (
    <button
      type="button"
      onPointerDown={empezar}
      onPointerUp={cancelar}
      onPointerLeave={cancelar}
      onPointerCancel={cancelar}
      onContextMenu={(e) => e.preventDefault()}
      className="relative select-none py-1 text-sm text-slate-500 [-webkit-touch-callout:none] [touch-action:manipulation]"
    >
      Acceso del negocio
      <span
        aria-hidden
        className={`absolute bottom-0 left-0 h-0.5 bg-marca-400 ${
          pulsando ? "w-full transition-[width] duration-[2000ms] ease-linear" : "w-0"
        }`}
      />
    </button>
  );
}
