export function fmtARS(n: number): string {
  return "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

// Formatea una fecha ISO (o Date) como "12 jun 2026". Devuelve "—" si es inválida.
import type { Address } from "@/lib/services/shipping";

// Formatea una dirección postal: "Calle Falsa 123, CP 99999"
export function fmtAddress(addr: Address): string {
  let result = `${addr.street } ${addr.number}`;
  if (addr.city) result += `, ${addr.city}`;
  result += ` (CP ${addr.zip})`;
  return result;
}

export function fmtDate(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.getDate()} ${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;
}
