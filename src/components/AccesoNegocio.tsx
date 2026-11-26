"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

const DURACION_MS = 2000;

/**
 * Acceso discreto al panel: hay que mantener pulsado el texto 2 segundos y
 * entonces aparece la pantalla de contraseña. Un toque normal no hace nada
 * y no hay ninguna señal visual. La seguridad real sigue siendo la contraseña.
 */
export function AccesoNegocio() {
  const router = useRouter();
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelar = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
  };

  const empezar = () => {
    cancelar();
    temporizador.current = setTimeout(() => {
      temporizador.current = null;
      router.push("/panel");
    }, DURACION_MS);
  };

  return (
    <button
      type="button"
      onPointerDown={empezar}
      onPointerUp={cancelar}
      onPointerLeave={cancelar}
      onPointerCancel={cancelar}
      onContextMenu={(e) => e.preventDefault()}
      className="select-none py-1 text-sm text-slate-500 [-webkit-touch-callout:none] [touch-action:manipulation]"
    >
      Acceso del negocio
    </button>
  );
}
