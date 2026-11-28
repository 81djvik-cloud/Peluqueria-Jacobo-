import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { db } from "./db";

/** Límites anti-abuso. Cámbialos aquí si el negocio lo necesita. */
export const MAX_CITAS_POR_TELEFONO = 2; // citas pendientes a la vez con el mismo teléfono
export const MAX_RESERVAS_POR_CONEXION_HORA = 2; // reservas por hora desde la misma conexión
export const MAX_FALLOS_CONTRASENA = 5; // intentos fallidos antes de bloquear
export const MINUTOS_BLOQUEO = 15;

function secreto(): string {
  const s = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("Falta la variable de entorno SESSION_SECRET o ADMIN_PASSWORD.");
  return s;
}

/** Firma HMAC con el secreto de la app (para huellas y claves privadas). */
export function firmar(valor: string): string {
  return createHmac("sha256", secreto()).update(valor).digest("base64url");
}

/**
 * Huella de la conexión del visitante: un hash de su IP, nunca la IP en claro.
 * En Vercel la IP real llega en x-real-ip / x-forwarded-for.
 */
export async function huellaConexion(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
  return firmar(`ip:${ip}`).slice(0, 32);
}

/** Minutos que quedan de bloqueo para esta huella (0 si no está bloqueada). */
export async function minutosBloqueado(clave: string): Promise<number> {
  const sql = await db();
  const [fila] = await sql<{ quedan: number | null }[]>`
    SELECT ceil(extract(epoch FROM bloqueado_hasta - now()) / 60)::int AS quedan
    FROM intentos_acceso
    WHERE clave = ${clave} AND bloqueado_hasta > now()
  `;
  return fila?.quedan ?? 0;
}

/** Suma un fallo; al llegar al máximo bloquea la huella durante MINUTOS_BLOQUEO. */
export async function registrarFallo(clave: string): Promise<void> {
  const sql = await db();
  await sql`
    INSERT INTO intentos_acceso (clave, fallos, actualizado)
    VALUES (${clave}, 1, now())
    ON CONFLICT (clave) DO UPDATE SET
      fallos = CASE
        WHEN intentos_acceso.actualizado < now() - interval '1 hour' THEN 1
        ELSE intentos_acceso.fallos + 1
      END,
      actualizado = now()
  `;
  await sql`
    UPDATE intentos_acceso
    SET bloqueado_hasta = now() + make_interval(mins => ${MINUTOS_BLOQUEO}), fallos = 0
    WHERE clave = ${clave} AND fallos >= ${MAX_FALLOS_CONTRASENA}
  `;
}

export async function limpiarFallos(clave: string): Promise<void> {
  const sql = await db();
  await sql`DELETE FROM intentos_acceso WHERE clave = ${clave}`;
}
