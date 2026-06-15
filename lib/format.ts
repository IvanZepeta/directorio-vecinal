// Formatea 10 dígitos como "81 1234 5678". Si no son 10, lo deja igual.
export function formatPhone(digits: string): string {
  if (!/^\d{10}$/.test(digits)) return digits;
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
}

// Deja solo los 10 dígitos del número: quita espacios, guiones, paréntesis,
// y la lada de México (+52 / 52 / 521) si la pegaron por error.
export function cleanPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("521")) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith("52")) digits = digits.slice(2);
  return digits;
}

// Nombre a mostrar según privacidad:
// - full=true  → nombre y primer apellido como mucho ("Edgar Hernández")
// - full=false → solo iniciales ("E.H.")
export function authorDisplay(
  fullName: string | null,
  full: boolean,
): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Vecino";
  const firstTwo = parts.slice(0, 2);
  if (full) return firstTwo.join(" ");
  return firstTwo.map((p) => p[0].toUpperCase()).join(".") + ".";
}
