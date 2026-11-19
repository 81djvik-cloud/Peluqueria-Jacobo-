type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const IconoTijeras = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
  </svg>
);
export const IconoCalendario = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
export const IconoReloj = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
export const IconoCheck = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const IconoX = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const IconoTelefono = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
export const IconoFlecha = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
export const IconoFlechaIzq = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
export const IconoLista = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);
export const IconoUbicacion = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
