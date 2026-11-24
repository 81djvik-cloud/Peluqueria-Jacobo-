"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export function LoginForm() {
  const [estado, accion, enviando] = useActionState(loginAction, { error: null });
  return (
    <form action={accion} className="space-y-5 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
      <label className="block">
        <span className="mb-2 block text-base font-semibold text-marca-700">Contraseña</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-xl border-0 bg-white px-4 py-4 text-lg ring-1 ring-slate-300 focus:outline-none focus:ring-2 focus:ring-marca-500"
        />
      </label>
      {estado.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="boton-3d w-full rounded-2xl px-6 py-4 text-xl font-bold"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-center text-sm text-slate-500">La sesión se recuerda en este dispositivo durante 30 días.</p>
    </form>
  );
}
