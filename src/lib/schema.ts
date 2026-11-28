/**
 * Esquema de la base de datos. Lo usan la app (se crea solo en la primera
 * petición) y el script `npm run db:seed`.
 *
 * `inicio` y `fin` guardan la hora local de Madrid (timestamp sin zona).
 * La restricción de exclusión impide, a nivel de base de datos, que dos
 * reservas activas se solapen: aunque dos clientes pulsen «Confirmar» a la
 * vez sobre la misma hora, solo una de las dos se guarda.
 */
export const SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS reservas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    servicio_id text NOT NULL,
    servicio_nombre text NOT NULL,
    precio numeric(6,2) NOT NULL,
    duracion_min integer NOT NULL CHECK (duracion_min > 0),
    inicio timestamp NOT NULL,
    fin timestamp NOT NULL,
    cliente_nombre text NOT NULL,
    cliente_telefono text NOT NULL,
    estado text NOT NULL DEFAULT 'pendiente'
      CHECK (estado IN ('pendiente', 'atendida', 'cancelada')),
    atendida_auto boolean NOT NULL DEFAULT false,
    creada_en timestamptz NOT NULL DEFAULT now(),
    actualizada_en timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT reservas_fin_posterior CHECK (fin > inicio),
    CONSTRAINT reservas_sin_solapes
      EXCLUDE USING gist (tsrange(inicio, fin, '[)') WITH &&)
      WHERE (estado <> 'cancelada')
  )`,
  `CREATE INDEX IF NOT EXISTS reservas_inicio_idx ON reservas (inicio)`,
  // Huella (hash) de la conexión que hizo la reserva, para limitar reservas en serie.
  // Nunca se guarda la IP en claro.
  `ALTER TABLE reservas ADD COLUMN IF NOT EXISTS origen text`,
  `CREATE INDEX IF NOT EXISTS reservas_origen_idx ON reservas (origen, creada_en)`,
  `CREATE INDEX IF NOT EXISTS reservas_telefono_idx ON reservas (cliente_telefono, fin)`,
  // Intentos fallidos de contraseña del panel, por huella de conexión.
  `CREATE TABLE IF NOT EXISTS intentos_acceso (
    clave text PRIMARY KEY,
    fallos integer NOT NULL DEFAULT 0,
    bloqueado_hasta timestamptz,
    actualizado timestamptz NOT NULL DEFAULT now()
  )`,
];
