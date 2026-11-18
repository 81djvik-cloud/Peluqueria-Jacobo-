import "server-only";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_SESION = "jacobo_admin";
const DURACION_SEG = 60 * 60 * 24 * 30; // 30 días

function secreto(): string {
  const s = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("Falta la variable de entorno ADMIN_PASSWORD.");
  return s;
}

function firmar(valor: string): string {
  return createHmac("sha256", secreto()).update(valor).digest("base64url");
}

function iguales(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function passwordCorrecta(intento: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) throw new Error("Falta la variable de entorno ADMIN_PASSWORD.");
  return iguales(intento, real);
}

export async function iniciarSesion(): Promise<void> {
  const expira = Math.floor(Date.now() / 1000) + DURACION_SEG;
  const valor = `${expira}.${firmar(String(expira))}`;
  (await cookies()).set(COOKIE_SESION, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEG,
  });
}

export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete(COOKIE_SESION);
}

export async function haySesion(): Promise<boolean> {
  const valor = (await cookies()).get(COOKIE_SESION)?.value;
  if (!valor) return false;
  const [expira, firma] = valor.split(".");
  if (!expira || !firma) return false;
  if (!iguales(firma, firmar(expira))) return false;
  return Number(expira) * 1000 > Date.now();
}
