export type Foto = { src: string; alt: string };

export const NEGOCIO = {
  nombre: "Peluquería Jacobo",
  /**
   * Fotos del local para la portada (hasta 4). Súbelas a /public/fotos y añádelas así:
   * { src: "/fotos/local-1.jpg", alt: "Sillones de la peluquería" }
   */
  fotos: [] as Foto[],
  /** Datos legales para la página de privacidad. PENDIENTES DE COMPLETAR por el titular. */
  legal: {
    titular: "", // nombre y apellidos o razón social del titular
    nif: "", // NIF/CIF
    email: "", // correo de contacto para ejercer derechos (opcional)
  },
  lemas: ["Amplia variedad de servicios para el hombre", "Adaptado para el niño"],
  direccion: "C. Lope de Vega, 10, 34001 Palencia",
  /** La dirección tal y como se muestra en la portada, una línea por renglón. */
  direccionLineas: ["C. Lope de Vega, 10", "34001", "Palencia"],
  mapaHref: "https://www.google.com/maps/search/?api=1&query=Peluquer%C3%ADa+Jacobo+C.+Lope+de+Vega+10+34001+Palencia",
  telefono: "639 72 04 01",
  telefonoHref: "+34639720401",
  horarioTexto: [
    { dias: "Lunes a Viernes", horas: ["09:30h a 14:00h", "16:30h a 20:30h"] },
    { dias: "Sábados", horas: ["09:00h a 14:30h"] },
  ],
};
