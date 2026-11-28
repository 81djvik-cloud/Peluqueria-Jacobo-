"use server";

import { redirect } from "next/navigation";
import { ahoraMadrid, esDiaReservable, horaAMinutos, horasLibres } from "@/lib/horario";
import {
  HoraOcupadaError,
  LimiteConexionError,
  LimiteTelefonoError,
  crearReserva,
  ocupadosDelDia,
} from "@/lib/reservas";
import { MAX_CITAS_POR_TELEFONO, MAX_RESERVAS_POR_CONEXION_HORA, huellaConexion } from "@/lib/seguridad";
import { getServicio } from "@/lib/servicios";
import { normalizarTelefono } from "@/lib/telefono";

export type EstadoFormulario = {
  error: string | null;
  campo?: "servicio" | "fecha" | "hora" | "nombre" | "telefono";
  horaOcupada?: boolean;
};

export async function reservarAction(
  _prev: EstadoFormulario,
  form: FormData,
): Promise<EstadoFormulario> {
  // Trampa para robots: este campo está oculto y una persona nunca lo rellena.
  if (String(form.get("web") ?? "").trim() !== "") {
    return { error: "No hemos podido guardar la cita. Inténtalo de nuevo en unos segundos." };
  }

  const servicio = getServicio(String(form.get("servicio") ?? ""));
  const fecha = String(form.get("fecha") ?? "");
  const minutos = horaAMinutos(String(form.get("hora") ?? ""));
  const nombre = String(form.get("nombre") ?? "").trim().replace(/\s+/g, " ");
  const telefono = normalizarTelefono(String(form.get("telefono") ?? ""));

  if (!servicio) return { error: "Elige un servicio.", campo: "servicio" };
  const ahora = ahoraMadrid();
  if (!esDiaReservable(fecha, ahora)) return { error: "Elige un día disponible.", campo: "fecha" };
  if (minutos === null) return { error: "Elige una hora.", campo: "hora" };
  if (nombre.length < 2 || nombre.length > 60)
    return { error: "Escribe tu nombre (mínimo 2 letras).", campo: "nombre" };
  if (!telefono)
    return { error: "Escribe un teléfono válido de 9 cifras, por ejemplo 612 345 678.", campo: "telefono" };

  const libres = horasLibres(fecha, servicio.duracion, await ocupadosDelDia(fecha), ahora);
  if (!libres.includes(minutos)) {
    return {
      error: "Lo sentimos, esa hora ya no está disponible. Elige otra, por favor.",
      campo: "hora",
      horaOcupada: true,
    };
  }

  let id: string;
  try {
    id = await crearReserva({
      servicio,
      fecha,
      minutos,
      nombre,
      telefono,
      origen: await huellaConexion(),
    });
  } catch (e) {
    if (e instanceof LimiteTelefonoError) {
      return {
        error: `Ya tienes ${MAX_CITAS_POR_TELEFONO} citas pendientes. Para reservar otra, pulsa «Llamar».`,
      };
    }
    if (e instanceof LimiteConexionError) {
      return {
        error: `Ya se han hecho ${MAX_RESERVAS_POR_CONEXION_HORA} reservas desde esta conexión en la última hora. Si necesitas otra, pulsa «Llamar».`,
      };
    }
    if (e instanceof HoraOcupadaError) {
      return {
        error: "Alguien acaba de reservar esa hora. Elige otra, por favor.",
        campo: "hora",
        horaOcupada: true,
      };
    }
    console.error(e);
    return { error: "No hemos podido guardar la cita. Inténtalo de nuevo en unos segundos." };
  }
  redirect(`/reserva/${id}`);
}
