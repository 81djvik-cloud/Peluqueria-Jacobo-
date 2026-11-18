export type Servicio = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number; // euros
  duracion: number; // minutos
};

const SERVICIOS_BASE: Servicio[] = [
  {
    id: "corte",
    nombre: "Corte de pelo",
    descripcion: "Corte clásico o moderno con tijera y máquina.",
    precio: 9,
    duracion: 15,
  },
  {
    id: "corte-barba",
    nombre: "Corte y barba",
    descripcion: "Corte de pelo y arreglo de barba con perfilado.",
    precio: 18,
    duracion: 30,
  },
  {
    id: "lavado-corte",
    nombre: "Lavado y corte",
    descripcion: "Lavado con champú, masaje y corte a tu gusto.",
    precio: 18,
    duracion: 30,
  },
  {
    id: "maquina",
    nombre: "Corte a máquina",
    descripcion: "Rapado o degradado a máquina, rápido y limpio.",
    precio: 9,
    duracion: 15,
  },
  {
    id: "navaja",
    nombre: "Corte a navaja",
    descripcion: "Acabado a navaja para un degradado perfecto.",
    precio: 12,
    duracion: 15,
  },
];

/** Servicios ordenados de menor a mayor precio (a igual precio, se mantiene el orden original). */
export const SERVICIOS: Servicio[] = [...SERVICIOS_BASE].sort((a, b) => a.precio - b.precio);

export function getServicio(id: string | null | undefined): Servicio | undefined {
  return SERVICIOS.find((s) => s.id === id);
}

export function formatPrecio(euros: number): string {
  return `${Number.isInteger(euros) ? euros : euros.toFixed(2).replace(".", ",")} €`;
}
