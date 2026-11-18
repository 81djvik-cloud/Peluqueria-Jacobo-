/** Normaliza un teléfono español: "+34 612-34-56-78" → "612 345 678". */
export function normalizarTelefono(entrada: string): string | null {
  let d = entrada.replace(/[\s.\-()]/g, "");
  if (d.startsWith("+34")) d = d.slice(3);
  else if (d.startsWith("0034")) d = d.slice(4);
  if (!/^[6789]\d{8}$/.test(d)) return null;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}
