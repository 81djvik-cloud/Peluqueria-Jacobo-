import { headers } from "next/headers";
import { claveAgenda } from "@/lib/agenda";
import { BotonCopiar } from "./BotonCopiar";

const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=com.google.android.apps.docs.editors.sheets";
const APP_STORE = "https://apps.apple.com/app/google-sheets/id842849113";

/** Tarjeta del panel: copia de la agenda (solo citas pendientes) en Google Sheets. */
export async function AgendaSheets() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const protocolo = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const url = `${protocolo}://${host}/api/agenda?clave=${claveAgenda()}`;
  const formula = `=IMPORTDATA("${url}")`;

  const ua = h.get("user-agent") ?? "";
  const esAndroid = /android/i.test(ua);
  const esIOS = /iphone|ipad|ipod/i.test(ua);
  const tiendas = [
    { nombre: "Google Play", href: PLAY_STORE, mostrar: esAndroid || !esIOS },
    { nombre: "App Store", href: APP_STORE, mostrar: esIOS || !esAndroid },
  ].filter((t) => t.mostrar);

  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div>
        <h2 className="text-xl font-bold">Copia de la agenda en Google Sheets</h2>
        <p className="mt-1 text-base text-slate-600">
          Una hoja de cálculo con las citas pendientes que se actualiza sola. Siempre es la misma
          hoja: no hay que descargar nada.
        </p>
      </div>

      <div className="space-y-3 rounded-xl bg-marca-50 p-4 ring-1 ring-marca-100">
        <p className="text-base font-semibold">¿Es la primera vez? Instala gratis Google Sheets en tu móvil:</p>
        <div className={`grid gap-3 ${tiendas.length > 1 ? "grid-cols-2" : ""}`}>
          {tiendas.map((t) => (
            <a
              key={t.nombre}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className="boton-3d-claro flex items-center justify-center rounded-xl px-3 py-3 text-base font-bold"
            >
              {t.nombre}
            </a>
          ))}
        </div>
        <p className="text-sm text-slate-600">
          Necesitas una cuenta de Google (la misma de Gmail). También funciona sin instalar nada
          entrando en <span className="font-semibold">sheets.google.com</span> desde el navegador.
        </p>
      </div>

      <ol className="list-decimal space-y-1 pl-5 text-base">
        <li>Abre Google Sheets y crea una hoja en blanco.</li>
        <li>Toca la celda A1 y pega esta fórmula:</li>
      </ol>
      <p className="break-all rounded-xl bg-slate-50 p-3 font-mono text-sm text-slate-700 ring-1 ring-slate-200">
        {formula}
      </p>
      <BotonCopiar texto={formula} />
      <ol start={3} className="list-decimal space-y-1 pl-5 text-base">
        <li>Espera unos segundos: aparecerán las citas pendientes y se irán actualizando solas.</li>
      </ol>

      <p className="text-sm text-slate-500">
        Google actualiza la hoja por su cuenta, más o menos cada hora: sirve como copia de
        seguridad, pero la agenda al momento es este panel. Este enlace es privado: no lo compartas.
      </p>

      <a
        href="/api/agenda?descargar=1"
        className="boton-3d-claro flex items-center justify-center rounded-xl px-4 py-3 text-center text-base font-bold"
      >
        Descargar ahora (CSV para Excel)
      </a>
    </section>
  );
}
