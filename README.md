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

- Horas cada 15 min, de 09:00 a 14:00 y de 16:00 a 20:30. Una cita tiene que **terminar** dentro de la franja:
  un servicio de 15 min puede empezar como muy tarde a las 13:45 / 20:15; uno de 30 min, a las 13:30 / 20:00.
- Abierto de lunes a sábado; el domingo, cerrado. Se puede reservar con hasta 14 días de antelación.
- Solo se muestran horas libres y futuras. Un servicio de 30 min ocupa dos huecos de 15.
- **Sin dobles reservas:** además de comprobarlo en el servidor, Postgres tiene una restricción de exclusión
  (`EXCLUDE USING gist (tsrange(inicio, fin) WITH &&)`). Si dos personas confirman la misma hora a la vez, solo entra una;
  a la otra se le avisa y se le recargan las horas libres.
- **Estado automático en el panel:** una cita pendiente cuya hora de fin (inicio + duración) ya ha pasado según la hora
  de Madrid se marca como *Atendida · auto*. El dueño puede marcarla como atendida antes a mano. Las citas canceladas
  liberan la hora. El panel se recarga solo cada minuto.

Los servicios están en `src/lib/servicios.ts`, los datos del negocio en `src/lib/negocio.ts` y el horario en `src/lib/horario.ts`.

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
4. Despliega. Para cargar los datos de ejemplo en la base de datos de producción (opcional), desde tu ordenador:

   ```bash
   vercel env pull .env.local
   npm run db:seed
   ```

Variables de entorno: `DATABASE_URL` (o `POSTGRES_URL`), `ADMIN_PASSWORD`, `SESSION_SECRET` (opcional; si falta se usa `ADMIN_PASSWORD`).
