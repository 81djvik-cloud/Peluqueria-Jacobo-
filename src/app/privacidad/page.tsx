import type { Metadata } from "next";
import { NEGOCIO } from "@/lib/negocio";
import { MESES_CONSERVACION } from "@/lib/reservas";

export const metadata: Metadata = { title: "Privacidad" };

function Pendiente({ valor, texto }: { valor: string; texto: string }) {
  return valor ? (
    <>{valor}</>
  ) : (
    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-sm font-semibold text-amber-800">
      {texto} (pendiente de completar)
    </span>
  );
}

export default function Privacidad() {
  const { legal } = NEGOCIO;
  return (
    <article className="space-y-6 text-base leading-relaxed text-slate-700">
      <h1 className="text-3xl font-extrabold tracking-tight text-marca-700">Privacidad</h1>
      <p>
        Esta página explica qué datos guardamos cuando reservas una cita en {NEGOCIO.nombre} y para
        qué los usamos.
      </p>

      <Bloque titulo="Responsable">
        <Pendiente valor={legal.titular} texto="Nombre del titular" /> · NIF{" "}
        <Pendiente valor={legal.nif} texto="NIF" />
        <br />
        {NEGOCIO.direccion} · Tel. {NEGOCIO.telefono}
        {legal.email && <> · {legal.email}</>}
      </Bloque>

      <Bloque titulo="Qué datos guardamos">
        Tu nombre, tu teléfono y los datos de la cita (servicio, día y hora). Nada más.
      </Bloque>

      <Bloque titulo="Para qué">
        Solo para gestionar tu cita: reservar tu hora, que no se la den a otra persona y poder
        avisarte si hubiera algún cambio. No enviamos publicidad.
      </Bloque>

      <Bloque titulo="Base legal">
        Que tú nos pides la cita: necesitamos estos datos para dártela (art. 6.1.b del RGPD).
      </Bloque>

      <Bloque titulo="Cuánto tiempo">
        Se borran automáticamente {MESES_CONSERVACION} meses después de la cita.
      </Bloque>

      <Bloque titulo="Quién más los ve">
        Nadie más. Solo los guardan, por cuenta nuestra, los proveedores técnicos de la web (Vercel,
        alojamiento, y Neon, base de datos), con las garantías que exige la ley.
      </Bloque>

      <Bloque titulo="Tus derechos">
        Puedes pedir ver, corregir o borrar tus datos, u oponerte a su uso, llamando al{" "}
        <a href={`tel:${NEGOCIO.telefonoHref}`} className="font-semibold text-marca-700">
          {NEGOCIO.telefono}
        </a>{" "}
        o en el propio local. Si crees que no los tratamos bien, puedes reclamar ante la Agencia
        Española de Protección de Datos (aepd.es).
      </Bloque>

      <p className="text-sm text-slate-500">
        En tu propio móvil, el navegador recuerda tu nombre y teléfono para que la próxima reserva sea
        más rápida. Puedes borrarlo limpiando los datos del navegador.
      </p>
    </article>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-marca-700">{titulo}</h2>
      <p className="mt-1">{children}</p>
    </section>
  );
}
