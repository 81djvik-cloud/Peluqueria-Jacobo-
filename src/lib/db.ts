import "server-only";
import postgres from "postgres";
import { SCHEMA_SQL } from "./schema";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

declare global {
  // Reutiliza la conexión entre recargas en desarrollo.
  var __jacoboSql: postgres.Sql | undefined;
  var __jacoboSchema: Promise<void> | undefined;
}

function crearCliente() {
  if (!url) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL (o POSTGRES_URL) con la conexión a Postgres.",
    );
  }
  return postgres(url, {
    max: 5,
    idle_timeout: 20,
    // Compatible con el pooler de Neon (PgBouncer en modo transacción).
    prepare: false,
    onnotice: () => {}, // silencia avisos como «la tabla ya existe»
  });
}

export function getSql(): postgres.Sql {
  globalThis.__jacoboSql ??= crearCliente();
  return globalThis.__jacoboSql;
}

/** Crea la tabla si no existe (una sola vez por instancia). */
export async function db(): Promise<postgres.Sql> {
  const sql = getSql();
  globalThis.__jacoboSchema ??= (async () => {
    for (const q of SCHEMA_SQL) await sql.unsafe(q);
  })().catch((e) => {
    globalThis.__jacoboSchema = undefined;
    throw e;
  });
  await globalThis.__jacoboSchema;
  return sql;
}
