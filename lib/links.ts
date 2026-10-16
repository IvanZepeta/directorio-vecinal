// Links del proveedor (Facebook, Instagram…). Los patrones son ESPEJO de
// `is_valid_provider_link` en la migración 0007: la BD es la frontera real y
// rechaza con 23514 lo que no cumpla. Si cambias uno, cambia el otro; si
// divergen, Zod deja pasar algo que la BD tumba y el vecino ve un error genérico.

export const LINK_KINDS = [
  "facebook",
  "instagram",
  "tiktok",
  "canva",
  "maps",
  "website",
] as const;

export type LinkKind = (typeof LINK_KINDS)[number];

export const LINK_META: Record<
  LinkKind,
  { label: string; placeholder: string; pattern: RegExp }
> = {
  facebook: {
    label: "Facebook",
    placeholder: "facebook.com/quintalosnogales",
    pattern:
      /^https:\/\/([a-z0-9-]+\.)*(facebook\.com|fb\.com|fb\.me)([/?#]|$)/i,
  },
  instagram: {
    label: "Instagram",
    placeholder: "instagram.com/quintalosnogales",
    pattern: /^https:\/\/([a-z0-9-]+\.)*instagram\.com([/?#]|$)/i,
  },
  tiktok: {
    label: "TikTok",
    placeholder: "tiktok.com/@quintalosnogales",
    pattern: /^https:\/\/([a-z0-9-]+\.)*tiktok\.com([/?#]|$)/i,
  },
  canva: {
    label: "Catálogo en Canva",
    placeholder: "quinta.my.canva.site",
    pattern: /^https:\/\/([a-z0-9-]+\.)*(canva\.com|canva\.site)([/?#]|$)/i,
  },
  maps: {
    label: "Google Maps",
    placeholder: "maps.app.goo.gl/…",
    pattern:
      /^https:\/\/(maps\.app\.goo\.gl\/|goo\.gl\/maps([/?#]|$)|maps\.google\.com(\.[a-z]{2})?([/?#]|$)|(www\.)?google\.com(\.[a-z]{2})?\/maps([/?#]|$))/i,
  },
  website: {
    label: "Sitio web",
    placeholder: "quintalosnogales.com",
    pattern: /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+([:/?#]|$)/i,
  },
};

// Nombre del campo en el formulario: `link_facebook`, `link_instagram`…
export const linkFieldName = (kind: LinkKind) => `link_${kind}` as const;

// El vecino pega "facebook.com/x" o "http://…": se completa a https antes de
// validar, igual que el teléfono se limpia antes de contar dígitos.
export function normalizeLink(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^http:\/\//i.test(trimmed)) return `https://${trimmed.slice(7)}`;
  // Ya trae esquema ("https://", "javascript:"…) → se deja tal cual y la
  // validación decide. "ejemplo.com:8080" no cuenta: tras ":" viene un puerto.
  if (!/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function isValidLink(kind: LinkKind, url: string): boolean {
  return (
    url.length <= 500 &&
    !/\s/.test(url) &&
    // "\" cuenta: el navegador lo trata como "/" y "maps\..\..\url" sale de /maps
    !/(\/\.\.|%2e|\\)/i.test(url) &&
    LINK_META[kind].pattern.test(url)
  );
}

// 23514 = check_violation. En el alta/edición de proveedor el único check que
// puede saltar es el de los links: Zod y la BD divergieron (ver arriba).
export function isLinkRejected(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23514"
  );
}

export const LINK_REJECTED_MESSAGE =
  "Uno de los links no es válido. Revísalo e intenta de nuevo.";
