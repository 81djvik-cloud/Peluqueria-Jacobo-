import Link from "next/link";
import { NEGOCIO } from "@/lib/negocio";
import { SERVICIOS, formatPrecio } from "@/lib/servicios";
import {
  IconoCalendario,
  IconoReloj,
  IconoSmartphone,
  IconoTijeras,
  IconoUbicacion,
} from "@/components/Iconos";

const VENTANA =
  "rounded-3xl bg-gradient-to-br from-marca-100 via-marca-50 to-white shadow-sm ring-1 ring-marca-100";

export default function Inicio() {
  const desde = SERVICIOS[0].precio;
  return (
    <div className="space-y-8">
      {/* Ocupa justo la primera pantalla: alto visible − cabecera − margen superior */}
      <section
        className={`${VENTANA} flex min-h-[calc(100svh_-_var(--alto-cabecera)_-_1px_-_2.25rem)] flex-col items-center justify-center px-5 py-7 text-center max-[380px]:py-5 sm:px-10 sm:py-10`}
      >
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-marca-500 text-white shadow-md max-[380px]:mb-3 max-[380px]:size-12 [@media(max-height:600px)]:hidden [@media(min-height:760px)]:mb-7 [@media(min-height:760px)]:size-20 [@media(min-height:760px)]:rounded-3xl">
          <IconoTijeras className="size-7 [@media(min-height:760px)]:size-10" />
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-marca-700 max-[380px]:text-[2rem] max-[380px]:leading-tight sm:text-5xl [@media(min-height:760px)]:text-5xl">
          {NEGOCIO.nombre}
        </h1>
        <div className="mx-auto mt-3 max-w-md space-y-1 text-xl leading-snug max-[380px]:mt-2 max-[380px]:text-lg [@media(min-height:760px)]:mt-6 [@media(min-height:760px)]:space-y-2 [@media(min-height:760px)]:text-[1.35rem]">
          <p className="text-marca-700">{NEGOCIO.lemas[0]}</p>
          <p className="font-semibold text-marca-600">{NEGOCIO.lemas[1]}</p>
          <p className="font-semibold text-marca-700">Cortes desde {formatPrecio(desde)}</p>
        </div>
        <Link
          href="/reservar"
          className="boton-3d mt-6 flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-2xl px-6 py-5 text-xl font-bold max-[380px]:mt-3 max-[380px]:gap-2 max-[380px]:px-4 max-[380px]:py-4 sm:mx-auto sm:max-w-sm [@media(min-height:760px)]:mt-10 [@media(min-height:760px)]:py-7 [@media(min-height:760px)]:text-2xl"
        >
          <IconoCalendario className="size-6 [@media(min-height:760px)]:size-7" />
          Reservar cita
        </Link>
        <p className="mt-3 text-base text-slate-600 max-[380px]:mt-2 max-[380px]:text-[0.9rem] [@media(min-height:760px)]:mt-5 [@media(min-height:760px)]:text-lg">
          Sin registros. Te lleva menos
          <br />
          de un minuto.
        </p>
      </section>

      <section className={`${VENTANA} p-6 sm:p-8`}>
        <IconoUbicacion className="mb-3 size-7 text-marca-600" />
        <h2 className="text-lg font-bold text-marca-700">Dónde estamos</h2>
        <a
          href={NEGOCIO.mapaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-marca-700 underline-offset-2 hover:underline"
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
          <IconoSmartphone className="size-6" />
          {NEGOCIO.telefono}
        </a>

        <div className="mt-6 border-t border-marca-200/70 pt-6">
          <IconoReloj className="mb-3 size-7 text-marca-600" />
          <h2 className="text-lg font-bold text-marca-700">Horario</h2>
          <dl className="mt-1 space-y-3 text-marca-700">
            {NEGOCIO.horarioTexto.map((h) => (
              <div key={h.dias}>
                <dt className="font-semibold text-marca-700">{h.dias}:</dt>
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
