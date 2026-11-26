"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";

/**
 * Next.js 16 conserva en memoria las páginas ya visitadas, incluido su
 * desplazamiento. Al cambiar de pantalla, volvemos siempre arriba del todo.
 */
export function ArribaAlNavegar() {
  return (
    <Suspense fallback={null}>
      <SubirAlCambiarDeRuta />
    </Suspense>
  );
}

function SubirAlCambiarDeRuta() {
  const ruta = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [ruta]);
  return null;
}
