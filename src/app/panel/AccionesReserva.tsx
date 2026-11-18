"use client";

import { useFormStatus } from "react-dom";
import { IconoCheck, IconoX } from "@/components/Iconos";
import { cancelarAction, marcarAtendidaAction } from "./actions";

function Boton({ children, variante }: { children: React.ReactNode; variante: "ok" | "cancelar" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-bold transition disabled:opacity-50 ${
        variante === "ok"
          ? "bg-emerald-600 text-white hover:bg-emerald-700"
          : "bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50"
      }`}
    >
      {children}
    </button>
  );
}

export function AccionesReserva({ id, nombre, hora }: { id: string; nombre: string; hora: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <form action={marcarAtendidaAction}>
        <input type="hidden" name="id" value={id} />
        <Boton variante="ok">
          <IconoCheck className="size-5" /> Atendida
        </Boton>
      </form>
      <form
        action={cancelarAction}
        onSubmit={(e) => {
          if (!confirm(`¿Cancelar la cita de ${nombre} a las ${hora}? La hora quedará libre.`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <Boton variante="cancelar">
          <IconoX className="size-5" /> Cancelar
        </Boton>
      </form>
    </div>
  );
}
