# Peluquería Jacobo · Reservas online

Web de reservas para una peluquería de barrio de hombre y niño. Pensada para móvil:
un cliente elige servicio, día y hora y confirma en menos de un minuto.

**Tecnología:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Postgres (Neon / Vercel Postgres) · Vercel.
Todas las fechas y horas se calculan en **Europe/Madrid**.

## Pantallas

| Ruta | Qué hace |
| --- | --- |
| `/` | Inicio: nombre, frase y botón grande «Reservar cita». |
| `/servicios` | Servicios ordenados de menor a mayor precio. Cada uno abre la reserva con ese servicio ya elegido. |
| `/reservar` | Servicio → día → hora libre → nombre y teléfono → «Confirmar cita». |
| `/reserva/[id]` | Resumen (día, fecha, hora, servicio, precio) con «Añadir al calendario» (.ics) y Google Calendar. |
| `/panel/login` | Contraseña de administrador. La sesión se guarda 30 días en una cookie firmada (httpOnly). |
| `/panel` | Reservas del día ordenadas por hora, con «Atendida» y «Cancelar». Se puede cambiar de día. |

## Reglas de negocio

- Horas cada 15 min según el horario real: **lunes a viernes** de 9:30 a 14:00 y de 16:30 a 20:30; **sábado** de 9:00 a 14:30;
  **domingo** cerrado. Una cita tiene que **terminar** dentro de la franja (un servicio de 30 min puede empezar como muy
  tarde a las 13:30 / 20:00 entre semana y a las 14:00 el sábado). Se puede reservar con hasta 14 días de antelación.
- Solo se muestran horas libres y futuras. Un servicio de 30 min ocupa dos huecos de 15.
- **Sin dobles reservas:** además de comprobarlo en el servidor, Postgres tiene una restricción de exclusión
  (`EXCLUDE USING gist (tsrange(inicio, fin) WITH &&)`). Si dos personas confirman la misma hora a la vez, solo entra una;
  a la otra se le avisa y se le recargan las horas libres.
- **Estado automático en el panel:** una cita pendiente cuya hora de fin (inicio + duración) ya ha pasado según la hora
  de Madrid se marca como *Atendida · auto*. El dueño puede marcarla como atendida antes a mano. Las citas canceladas
  liberan la hora. El panel se recarga solo cada minuto.

Los servicios están en `src/lib/servicios.ts`, los datos del negocio en `src/lib/negocio.ts` y el horario por día de la semana en `src/lib/horario.ts` (`HORARIO_SEMANAL`).

## Desarrollo local

```bash
cp .env.example .env.local   # rellena DATABASE_URL y ADMIN_PASSWORD
npm install
npm run db:seed              # crea la tabla y carga reservas de ejemplo
npm run dev
```

`npm run db:seed -- --reset` borra todas las reservas y vuelve a cargar los datos de ejemplo.
La tabla también se crea sola en la primera petición si no existe.

## Despliegue en Vercel

1. Sube este proyecto a un repositorio de GitHub e impórtalo en Vercel (**Add New → Project**).
2. En el proyecto de Vercel: **Storage → Create Database → Neon (Postgres)** y conéctala al proyecto.
   La integración crea `DATABASE_URL` automáticamente. Elige la región de Fráncfort (`eu-central-1`) para estar cerca de España.
3. En **Settings → Environment Variables** añade:
   - `ADMIN_PASSWORD`: la contraseña del panel.
   - `SESSION_SECRET`: una cadena larga aleatoria (por ejemplo, `openssl rand -base64 32`).
4. Despliega. La tabla se crea sola en la primera visita.

> ⚠️ `npm run db:seed` es **solo para pruebas en local**. Si `DATABASE_URL` no es local, el script se niega a
> actuar (salvo `PERMITIR_DATOS_EJEMPLO=si`), y `--reset` contra una base de datos no local exige además
> `CONFIRMAR_BORRADO=BORRAR-TODAS-LAS-CITAS`. Nunca lo uses con la agenda real.

## Seguridad

- Contraseña del panel comparada de forma segura; sesión en cookie firmada (httpOnly, 30 días).
- **5 intentos fallidos → bloqueo de 15 minutos** por conexión.
- **Máximo 2 citas pendientes por teléfono** y **2 reservas por hora desde la misma conexión**; al superarlo se
  invita a llamar. Trampa invisible para robots. Límites en `src/lib/seguridad.ts`.
- Consultas parametrizadas (sin inyección SQL), validación en el servidor y restricción en la base de datos que
  impide dobles reservas.
- Cabeceras de seguridad (`next.config.ts`): sin incrustación en otras webs, `nosniff`, HSTS…
- Las IP nunca se guardan en claro (solo una huella cifrada).
- Recomendado: verificación en dos pasos en GitHub, Vercel, Neon y Google; contraseña del panel de 16+ caracteres;
  repositorio privado.

## Privacidad (RGPD)

Aviso bajo el formulario y página `/privacidad`. Las citas se **borran solas a los 3 meses**
(`MESES_CONSERVACION` en `src/lib/reservas.ts`). Completa los datos del titular en `NEGOCIO.legal`
(`src/lib/negocio.ts`). La página es una plantilla; conviene que la revise un asesor.

## Copias y recuperación

- **Neon** guarda un historial que permite restaurar la base de datos a un momento anterior (la duración depende
  del plan). Se hace desde la consola de Neon.
- **Agenda en Google Sheets:** en el panel hay una fórmula `=IMPORTDATA(...)` con un enlace privado que devuelve las
  citas pendientes. Pegada en una hoja de Google, se actualiza sola (Google refresca más o menos cada hora). También
  hay un botón para descargarla en CSV. El enlace cambia si cambias `SESSION_SECRET`.

Variables de entorno: `DATABASE_URL` (o `POSTGRES_URL`), `ADMIN_PASSWORD`, `SESSION_SECRET` (opcional; si falta se usa `ADMIN_PASSWORD`).

