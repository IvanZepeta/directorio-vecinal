import type { Provider } from "@/lib/types";

// Lo que se ve al compartir la ficha (WhatsApp, Facebook…). Va a servicios de
// terceros que lo cachean, así que lleva SOLO lo que ya es público sin sesión
// y nada más. A propósito NO lleva el teléfono: si va en el preview la gente
// escribe directo desde el chat, nunca pasa por /ir/:id y el contacto no se
// cuenta. Tampoco autores de reseñas (privacidad, ver migración 0006).

export const SITE_NAME = "Directorio vecinal";

// Primeras líneas de la descripción en una sola, sin los guiones de lista.
export function descriptionExcerpt(text: string | null, max = 140): string {
  if (!text) return "";
  const flat = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-–•]\s*/, "").trim())
    .filter(Boolean)
    // "Incluye:" va pegado a lo que sigue, no separado por un punto
    .reduce((acc, line) =>
      !acc ? line : acc.endsWith(":") ? `${acc} ${line}` : `${acc} · ${line}`,
    "");
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

export function ratingLabel(provider: Provider): string | null {
  if (provider.average_rating === null) return null;
  const reviews = `${provider.review_count} reseña${provider.review_count === 1 ? "" : "s"}`;
  return `★ ${provider.average_rating.toFixed(1)} (${reviews})`;
}

export function shareDescription(provider: Provider): string {
  return [
    provider.categories.map((c) => c.name).join(", "),
    ratingLabel(provider),
    descriptionExcerpt(provider.description),
  ]
    .filter(Boolean)
    .join(" · ");
}
