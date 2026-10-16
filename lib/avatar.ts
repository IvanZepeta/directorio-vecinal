// Paleta de fondos sólidos que se ven bien en claro y oscuro (texto blanco).
// Clases completas literales para que Tailwind las detecte en el build.
const AVATAR_BG = [
  "bg-emerald-600",
  "bg-blue-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-teal-600",
  "bg-indigo-600",
  "bg-orange-600",
];

// Los mismos colores en hex, en el mismo orden: la imagen para compartir
// (next/og) no entiende clases de Tailwind.
const AVATAR_HEX = [
  "#059669",
  "#2563eb",
  "#7c3aed",
  "#d97706",
  "#e11d48",
  "#0d9488",
  "#4f46e5",
  "#ea580c",
];

// Mismo nombre → mismo color, siempre (determinista).
function avatarIndex(name: string): number {
  let hash = 0;
  for (const ch of name) {
    hash = (hash + ch.charCodeAt(0)) % AVATAR_BG.length;
  }
  return hash;
}

export function avatarBg(name: string): string {
  return AVATAR_BG[avatarIndex(name)];
}

export function avatarHex(name: string): string {
  return AVATAR_HEX[avatarIndex(name)];
}

export function avatarInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}
