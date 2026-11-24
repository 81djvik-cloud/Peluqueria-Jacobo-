import Link from "next/link";
import { NEGOCIO } from "@/lib/negocio";
import { SERVICIOS, formatPrecio } from "@/lib/servicios";
import {
  IconoCalendario,
  IconoReloj,
  IconoTelefono,
  IconoTijeras,
  IconoUbicacion,
} from "@/components/Iconos";

const VENTANA =
  "rounded-3xl bg-gradient-to-br from-marca-100 via-marca-50 to-white shadow-sm ring-1 ring-marca-100";

export default function Inicio() {
  const desde = SERVICIOS[0].precio;
  return (
    <div className="space-y-8">
      <section className={`${VENTANA} px-5 py-7 text-center max-[380px]:py-5 sm:px-10 sm:py-10`}>
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-marca-500 text-white shadow-md max-[380px]:mb-3 max-[380px]:size-12 [@media(max-height:600px)]:hidden">
          <IconoTijeras className="size-7" />
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-marca-900 max-[380px]:text-[2rem] max-[380px]:leading-tight sm:text-5xl">
          {NEGOCIO.nombre}
        </h1>
        <div className="mx-auto mt-3 max-w-md space-y-1 text-xl leading-snug max-[380px]:mt-2 max-[380px]:text-lg">
          <p className="text-marca-800">{NEGOCIO.lemas[0]}</p>
          <p className="font-semibold text-marca-600">{NEGOCIO.lemas[1]}</p>
        </div>
        <Link
          href="/servicios"
          className="mt-5 inline-block rounded-full max-[380px]:mt-3 bg-white px-4 py-1.5 text-base font-bold text-marca-700 ring-1 ring-marca-200 transition hover:bg-marca-50"
        >
          Cortes desde {formatPrecio(desde)}
        </Link>
        <Link
          href="/reservar"
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl bg-marca-600 px-6 py-5 max-[380px]:mt-3 max-[380px]:py-4 max-[380px]:gap-2 max-[380px]:px-4 whitespace-nowrap text-xl font-bold text-white shadow-lg shadow-marca-600/25 transition hover:bg-marca-700 active:scale-[0.98] sm:mx-auto sm:max-w-sm"
        >
          <IconoCalendario className="size-6" />
          Reservar cita
        </Link>
        <p className="mt-3 text-base text-slate-600 max-[380px]:mt-2 max-[380px]:text-[0.9rem]">Sin registros. Te lleva menos de un minuto.</p>
      </section>

      <section className={`${VENTANA} p-6 sm:p-8`}>
        <IconoUbicacion className="mb-3 size-7 text-marca-600" />
        <h2 className="text-lg font-bold text-marca-900">Dónde estamos</h2>
        <a
          href={NEGOCIO.mapaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-marca-800 underline-offset-2 hover:underline"
        >
          {NEGOCIO.direccionLineas.map((linea) => (
            <span key={linea} className="block">
              {linea}
            </span>
          ))}
        </a>
        <a
          href={`tel:${NEGOCIO.telefonoHref}`}
          className="mt-3 inline-flex items-center gap-2 font-bold text-marca-700"
        >
          <IconoTelefono className="size-5" />
          {NEGOCIO.telefono}
        </a>

        <div className="mt-6 border-t border-marca-200/70 pt-6">
          <IconoReloj className="mb-3 size-7 text-marca-600" />
          <h2 className="text-lg font-bold text-marca-900">Horario</h2>
          <dl className="mt-1 space-y-3 text-marca-800">
            {NEGOCIO.horarioTexto.map((h) => (
              <div key={h.dias}>
                <dt className="font-semibold text-marca-900">{h.dias}:</dt>
                {h.horas.map((turno) => (
                  <dd key={turno} className="tabular-nums">
                    {turno}
                  </dd>
                ))}
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
