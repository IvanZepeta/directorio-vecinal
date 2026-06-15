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

// Mismo nombre → mismo color, siempre (determinista).
export function avatarBg(name: string): string {
  let hash = 0;
  for (const ch of name) {
    hash = (hash + ch.charCodeAt(0)) % AVATAR_BG.length;
  }
  return AVATAR_BG[hash];
}

export function avatarInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}
