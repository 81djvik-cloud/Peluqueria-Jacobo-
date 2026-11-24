import type { Metadata } from "next";
import { ListaServicios } from "./ListaServicios";

export const metadata: Metadata = { title: "Servicios" };

export default function Servicios() {
  return (
    <div className="-mt-2 space-y-4">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Servicios</h1>
        <p className="text-sm text-slate-500">Precios con IVA incluido</p>
      </header>
      <ListaServicios />
    </div>
  );
}
