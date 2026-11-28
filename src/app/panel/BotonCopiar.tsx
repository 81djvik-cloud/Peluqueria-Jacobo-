"use client";

import { useState } from "react";

export function BotonCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
        } catch {
          // Navegadores antiguos: seleccionar y copiar a mano.
          const area = document.createElement("textarea");
          area.value = texto;
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          area.remove();
        }
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      }}
      className="boton-3d w-full rounded-xl px-4 py-3 text-base font-bold"
    >
      {copiado ? "¡Copiada!" : "Copiar fórmula"}
    </button>
  );
}
