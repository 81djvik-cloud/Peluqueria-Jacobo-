"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { cerrarSesion, haySesion, iniciarSesion, passwordCorrecta } from "@/lib/auth";
import { cambiarEstado } from "@/lib/reservas";
import { huellaConexion, limpiarFallos, minutosBloqueado, registrarFallo } from "@/lib/seguridad";

export async function loginAction(
  _prev: { error: string | null },
  form: FormData,
): Promise<{ error: string | null }> {
  const clave = await huellaConexion();
  const bloqueo = await minutosBloqueado(clave);
  if (bloqueo > 0) {
    return {
      error: `Demasiados intentos. Vuelve a probar dentro de ${bloqueo} minuto${bloqueo === 1 ? "" : "s"}.`,
    };
  }

  const password = String(form.get("password") ?? "");
  if (!passwordCorrecta(password)) {
    await new Promise((r) => setTimeout(r, 600)); // frena intentos por fuerza bruta
    await registrarFallo(clave);
    const ahora = await minutosBloqueado(clave);
    if (ahora > 0) {
      return {
        error: `Demasiados intentos. Vuelve a probar dentro de ${ahora} minutos.`,
      };
    }
    return { error: "Contraseña incorrecta." };
  }
  await limpiarFallos(clave);
  await iniciarSesion();
  redirect("/panel");
}

export async function logoutAction() {
  await cerrarSesion();
  redirect("/panel/login");
}

async function exigirSesion() {
  if (!(await haySesion())) redirect("/panel/login");
}

export async function marcarAtendidaAction(form: FormData) {
  await exigirSesion();
  await cambiarEstado(String(form.get("id") ?? ""), "atendida");
  refresh();
}

export async function cancelarAction(form: FormData) {
  await exigirSesion();
  await cambiarEstado(String(form.get("id") ?? ""), "cancelada");
  refresh();
}
