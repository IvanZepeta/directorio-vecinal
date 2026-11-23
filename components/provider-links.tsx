import { LINK_META, type LinkKind } from "@/lib/links";
import type { ProviderLink } from "@/lib/types";

// Color de marca como punto junto al nombre: suficiente para reconocerla de un
// vistazo sin cargar logos de terceros (la CSP tampoco los dejaría pasar).
const DOT: Record<LinkKind, string> = {
  facebook: "bg-[#1877F2]",
  instagram: "bg-[#E4405F]",
  tiktok: "bg-zinc-900 dark:bg-zinc-100",
  canva: "bg-[#00C4CC]",
  maps: "bg-[#34A853]",
  website: "bg-zinc-400",
};

// Donde se suelen ver fotos de sus trabajos: se ofrece cuando la ficha aún no
// tiene fotos propias. Maps queda fuera, no es galería.
const GALLERY_KINDS: LinkKind[] = [
  "facebook",
  "instagram",
  "tiktok",
  "canva",
  "website",
];

export const galleryLinks = (links: ProviderLink[]) =>
  links.filter((l) => GALLERY_KINDS.includes(l.kind));

function LinkPill({ link }: { link: ProviderLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      // nofollow: el sitio es indexable y no queremos pasarle ranking a
      // páginas de terceros que el admin no controla.
      rel="noopener noreferrer nofollow"
      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${DOT[link.kind]}`}
      />
      {LINK_META[link.kind].label}
      <span aria-hidden="true" className="text-zinc-400">
        ↗
      </span>
    </a>
  );
}

export function ProviderLinks({ links }: { links: ProviderLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-zinc-500">También en:</span>
      {links.map((link) => (
        <LinkPill key={link.kind} link={link} />
      ))}
    </div>
  );
}

// Estado vacío de la galería: en lugar de "no hay fotos", manda a donde sí hay.
export function PhotosElsewhere({ links }: { links: ProviderLink[] }) {
  const gallery = galleryLinks(links);
  if (gallery.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
      <span className="text-sm text-zinc-500">
        Aún no hay fotos aquí. Mira sus trabajos en
      </span>
      {gallery.map((link) => (
        <LinkPill key={link.kind} link={link} />
      ))}
    </div>
  );
}
