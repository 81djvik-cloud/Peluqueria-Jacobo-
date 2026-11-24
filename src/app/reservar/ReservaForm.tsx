"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { SERVICIOS, formatPrecio, getServicio } from "@/lib/servicios";
import { reservarAction, type EstadoFormulario } from "./actions";

export type DiaOpcion = { fecha: string; etiqueta: string; dia: number; mes: string };

const CLAVE_CLIENTE = "jacobo:cliente";

type Disponibilidad =
  | { estado: "sin-servicio" }
  | { estado: "cargando" }
  | { estado: "error" }
  | { estado: "ok"; horas: string[] };

function leerClienteGuardado(): string | null {
  try {
    return localStorage.getItem(CLAVE_CLIENTE);
  } catch {
    return null;
  }
}
const sinSuscripcion = () => () => {};

export function ReservaForm({
  dias,
  servicioInicial,
}: {
  dias: DiaOpcion[];
  servicioInicial: string | null;
}) {
  const [servicioId, setServicioId] = useState<string | null>(servicioInicial);
  const [fecha, setFecha] = useState<string | null>(dias[0]?.fecha ?? null);
  const [horaElegida, setHora] = useState<string | null>(null);
  // null = el cliente aún no ha escrito nada: usamos lo recordado de la última vez.
  const [nombreEditado, setNombre] = useState<string | null>(null);
  const [telefonoEditado, setTelefono] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [cargado, setCargado] = useState<{ clave: string; horas: string[] | null } | null>(null);

  const guardadoTexto = useSyncExternalStore(sinSuscripcion, leerClienteGuardado, () => null);
  const guardado = useMemo(() => {
    try {
      return (JSON.parse(guardadoTexto ?? "null") ?? {}) as { nombre?: string; telefono?: string };
    } catch {
      return {};
    }
  }, [guardadoTexto]);
  const nombre = nombreEditado ?? guardado.nombre ?? "";
  const telefono = telefonoEditado ?? guardado.telefono ?? "";

  const refDatos = useRef<HTMLElement>(null);
  const refHoras = useRef<HTMLElement>(null);
  const servicio = getServicio(servicioId);

  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    async (prev, form) => {
      const res = await reservarAction(prev, form);
      if (res.horaOcupada) {
        // Esa hora se ha ocupado mientras tanto: recargamos las horas libres.
        setHora(null);
        setVersion((v) => v + 1);
        refHoras.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return res;
    },
    { error: null },
  );

  const clave = servicioId && fecha ? `${servicioId}|${fecha}|${version}` : null;

  useEffect(() => {
    if (!clave) return;
    const [s, f] = clave.split("|");
    const ctrl = new AbortController();
    fetch(`/api/disponibilidad?fecha=${f}&servicio=${encodeURIComponent(s)}`, {
      cache: "no-store",
      signal: ctrl.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((datos: { horas: string[] }) => setCargado({ clave, horas: datos.horas }))
      .catch((e: Error) => {
        if (e.name !== "AbortError") setCargado({ clave, horas: null });
      });
    return () => ctrl.abort();
  }, [clave]);

  const disp: Disponibilidad = !clave
    ? { estado: "sin-servicio" }
    : cargado?.clave !== clave
      ? { estado: "cargando" }
      : cargado.horas === null
        ? { estado: "error" }
        : { estado: "ok", horas: cargado.horas };

  const reintentar = () => setVersion((v) => v + 1);

  const elegirHora = (h: string) => {
    setHora(h);
    if (!nombre || !telefono) {
      setTimeout(() => refDatos.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  const alEnviar = () => {
    try {
      localStorage.setItem(CLAVE_CLIENTE, JSON.stringify({ nombre: nombre.trim(), telefono }));
    } catch {}
  };

  const horas = disp.estado === "ok" ? disp.horas : [];
  // Si la hora elegida deja de estar libre (otro servicio u otro día), se descarta.
  const hora = horaElegida && horas.includes(horaElegida) ? horaElegida : null;
  const manana = horas.filter((h) => h < "15:00");
  const tarde = horas.filter((h) => h >= "15:00");
  const diaElegido = dias.find((d) => d.fecha === fecha);
  const faltan = [
    !servicio && "servicio",
    !fecha && "día",
    !hora && "hora",
    nombre.trim().length < 2 && "nombre",
    !telefono.trim() && "teléfono",
  ].filter((x): x is string => Boolean(x));
  const listo = faltan.length === 0;
  const textoFalta =
    faltan.length > 1 ? `${faltan.slice(0, -1).join(", ")} y ${faltan.at(-1)}` : faltan[0];

  if (dias.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-6 text-lg ring-1 ring-slate-200">
        Ahora mismo no hay días disponibles para reservar. Llámanos y te buscamos un hueco.
      </p>
    );
  }

  return (
    <form action={accion} onSubmit={alEnviar} className="space-y-10" noValidate>
      <input type="hidden" name="servicio" value={servicioId ?? ""} />
      <input type="hidden" name="fecha" value={fecha ?? ""} />
      <input type="hidden" name="hora" value={hora ?? ""} />

      {/* 1. Servicio */}
      <Paso numero={1} titulo="Servicio">
        <div className="grid gap-4" role="radiogroup" aria-label="Servicio">
          {SERVICIOS.map((s) => {
            const activo = s.id === servicioId;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => setServicioId(s.id)}
                className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left text-lg ${
                  activo ? "pulsado font-bold" : "boton-3d-claro font-semibold text-marca-700"
                }`}
              >
                <span>{s.nombre}</span>
                <span className={activo ? "text-white" : "text-marca-700"}>{formatPrecio(s.precio)}</span>
              </button>
            );
          })}
        </div>
      </Paso>

      {/* 2. Día */}
      <Paso numero={2} titulo="Día">
        <div className="sin-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-3 pt-1 sm:mx-0 sm:px-1">
          {dias.map((d) => {
            const activo = d.fecha === fecha;
            return (
              <button
                key={d.fecha}
                type="button"
                aria-pressed={activo}
                onClick={() => setFecha(d.fecha)}
                className={`flex min-w-[4.75rem] shrink-0 flex-col items-center rounded-2xl px-3 py-3 ${
                  activo ? "pulsado" : "boton-3d-claro text-marca-700"
                }`}
              >
                <span className={`text-sm font-semibold ${activo ? "text-marca-50" : "text-slate-500"}`}>
                  {d.etiqueta}
                </span>
                <span className="text-2xl font-extrabold leading-tight">{d.dia}</span>
                <span className={`text-sm ${activo ? "text-marca-50" : "text-slate-500"}`}>{d.mes}</span>
              </button>
            );
          })}
        </div>
      </Paso>

      {/* 3. Hora */}
      <Paso numero={3} titulo="Hora" refSeccion={refHoras}>
        {disp.estado === "sin-servicio" && (
          <Aviso>Elige primero un servicio para ver las horas libres.</Aviso>
        )}
        {disp.estado === "cargando" && (
          <div className="grid grid-cols-4 gap-2" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-marca-100/70" />
            ))}
          </div>
        )}
        {disp.estado === "error" && (
          <Aviso>
            No hemos podido cargar las horas.{" "}
            <button
              type="button"
              className="font-bold text-marca-700 underline"
              onClick={reintentar}
            >
              Reintentar
            </button>
          </Aviso>
        )}
        {disp.estado === "ok" && horas.length === 0 && (
          <Aviso>No quedan horas libres este día. Prueba con otro día.</Aviso>
        )}
        {disp.estado === "ok" && horas.length > 0 && (
          <div className="space-y-5">
            <GrupoHoras titulo="Mañana" horas={manana} hora={hora} onElegir={elegirHora} />
            <GrupoHoras titulo="Tarde" horas={tarde} hora={hora} onElegir={elegirHora} />
          </div>
        )}
      </Paso>

      {/* 4. Datos */}
      <Paso numero={4} titulo="Tus datos" refSeccion={refDatos}>
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-base font-semibold text-marca-700">Nombre</span>
            <input
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
              placeholder="Ej.: Javier Martín"
              maxLength={60}
              aria-invalid={estado.campo === "nombre"}
              className="w-full rounded-xl border-0 bg-white px-4 py-4 text-lg ring-1 ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-marca-500 aria-[invalid=true]:ring-red-500"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-base font-semibold text-marca-700">Teléfono</span>
            <input
              name="telefono"
              type="tel"
              inputMode="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              autoComplete="tel"
              placeholder="Ej.: 612 345 678"
              maxLength={20}
              aria-invalid={estado.campo === "telefono"}
              className="w-full rounded-xl border-0 bg-white px-4 py-4 text-lg ring-1 ring-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-marca-500 aria-[invalid=true]:ring-red-500"
            />
          </label>
        </div>
      </Paso>

      {/* Confirmación fija abajo */}
      <div className="sticky bottom-0 -mx-5 border-t border-marca-100 bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
        {estado.error && (
          <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
            {estado.error}
          </p>
        )}
        <p className="mb-3 min-h-[1.5em] text-base text-slate-600" aria-live="polite">
          {servicio ? (
            <>
              <span className="font-bold text-marca-700">{servicio.nombre}</span>
              {diaElegido && <> · {diaElegido.etiqueta} {diaElegido.dia} {diaElegido.mes}</>}
              {hora && <> · {hora} h</>} · {formatPrecio(servicio.precio)}
            </>
          ) : (
            "Elige un servicio para empezar."
          )}
        </p>
        <button
          type="submit"
          disabled={!listo || enviando}
          className="boton-3d w-full rounded-2xl px-6 py-5 text-xl font-bold"
        >
          {enviando ? "Reservando…" : "Confirmar cita"}
        </button>
        {!listo && (
          <p className="mt-3 text-center text-base font-semibold text-amber-700" aria-live="polite">
            Falta: {textoFalta}
          </p>
        )}
      </div>
    </form>
  );
}

function Paso({
  numero,
  titulo,
  children,
  refSeccion,
}: {
  numero: number;
  titulo: string;
  children: React.ReactNode;
  refSeccion?: React.Ref<HTMLElement>;
}) {
  return (
    <section ref={refSeccion} className="scroll-mt-24 space-y-4">
      <h2 className="flex items-center gap-3 text-xl font-bold">
        <span className="grid size-8 place-items-center rounded-full bg-marca-100 text-base font-extrabold text-marca-700">
          {numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function GrupoHoras({
  titulo,
  horas,
  hora,
  onElegir,
}: {
  titulo: string;
  horas: string[];
  hora: string | null;
  onElegir: (h: string) => void;
}) {
  if (horas.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-base font-semibold text-slate-500">{titulo}</h3>
      <div className="grid grid-cols-4 gap-x-2 gap-y-3">
        {horas.map((h) => {
          const activo = h === hora;
          return (
            <button
              key={h}
              type="button"
              aria-pressed={activo}
              onClick={() => onElegir(h)}
              className={`rounded-xl py-3 text-lg font-bold tabular-nums ${
                activo ? "pulsado" : "boton-3d-claro text-marca-700"
              }`}
            >
              {h}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-marca-50 px-5 py-4 text-lg text-marca-700 ring-1 ring-marca-100">{children}</p>;
}
