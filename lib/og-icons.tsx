// Íconos de categoría para la imagen al compartir (lib/og.tsx). Se dibujan en
// SVG a mano y no con una librería de íconos ni emoji: next/og no trae emoji
// (habría que bajarlos de una CDN en cada render) y una librería es una
// instalación más que auditar. Blanco sobre el color del avatar; `bg` es ese
// color, para los recortes que deben verse "huecos".
//
// Se eligen por `categories.icon`, no por el nombre en español: el nombre lo
// puede cambiar el admin, el slug no se muestra en ningún lado. Una categoría
// nueva sin ícono aquí cae a la inicial del proveedor.

const W = "#fff";

type Glyph = (bg: string) => React.ReactNode;

const stroke = {
  fill: "none",
  stroke: W,
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const GLYPHS: Record<string, Glyph> = {
  droplet: () => (
    <path fill={W} d="M12 2.5c-3.2 4.6-6.5 8-6.5 11.5a6.5 6.5 0 0 0 13 0c0-3.5-3.3-6.9-6.5-11.5z" />
  ),
  bolt: () => <path fill={W} d="M13.5 2 4 14h7l-1 8 10-12.5h-7.2z" />,
  snowflake: () => (
    <g {...stroke}>
      <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7" />
      <path d="m9.5 3.5 2.5 2 2.5-2M9.5 20.5l2.5-2 2.5 2" />
    </g>
  ),
  plant: () => (
    <g>
      <path {...stroke} d="M12 21V11M7 21h10" />
      <path fill={W} d="M12 13C12 8.6 8.8 5.5 3.5 5.5c0 4.4 3.2 7.5 8.5 7.5z" />
      <path fill={W} d="M12 11c0-4.4 3.2-7.5 8.5-7.5 0 4.4-3.2 7.5-8.5 7.5z" />
    </g>
  ),
  bug: () => (
    <g>
      <path
        {...stroke}
        d="M7 11 3.5 9M7 15H3M7.5 18.5 4.5 21M17 11l3.5-2M17 15h4M16.5 18.5l3 2.5M10.5 5 9 2.5M13.5 5 15 2.5"
      />
      <ellipse fill={W} cx="12" cy="14.5" rx="5" ry="6.5" />
      <circle fill={W} cx="12" cy="6.5" r="2.8" />
    </g>
  ),
  wall: () => (
    <g fill={W}>
      <rect x="2" y="3.5" width="9" height="5" rx="1" />
      <rect x="13" y="3.5" width="9" height="5" rx="1" />
      <rect x="2" y="9.5" width="4" height="5" rx="1" />
      <rect x="8" y="9.5" width="8" height="5" rx="1" />
      <rect x="18" y="9.5" width="4" height="5" rx="1" />
      <rect x="2" y="15.5" width="9" height="5" rx="1" />
      <rect x="13" y="15.5" width="9" height="5" rx="1" />
    </g>
  ),
  // Rodillo de pintura
  brush: () => (
    <g>
      <rect fill={W} x="3" y="3" width="15" height="6" rx="1.5" />
      <path {...stroke} d="M18 6h2.5v5.5H12V14" />
      <rect fill={W} x="10.5" y="14" width="3" height="7.5" rx="1" />
    </g>
  ),
  cake: (bg) => (
    <g>
      <path fill={W} d="M12 2c1.3 1.5 1.7 2.6 0 3.8-1.7-1.2-1.3-2.3 0-3.8z" />
      <rect fill={W} x="11" y="7" width="2" height="4.5" />
      <rect fill={W} x="3" y="11.5" width="18" height="10" rx="2" />
      {/* Línea del betún, "recortada" con el color de fondo */}
      <path
        fill="none"
        stroke={bg}
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M3 15.5c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0"
      />
    </g>
  ),
  // Tijeras (Costura)
  needle: () => (
    <g>
      <path {...stroke} d="M8.2 8.2 20 20M8.2 15.8 20 4" />
      <circle {...stroke} cx="6" cy="6" r="3" />
      <circle {...stroke} cx="6" cy="18" r="3" />
    </g>
  ),
  // Destellos (Limpieza)
  wash: () => (
    <g>
      <path fill={W} d="M10 2.5 12 9l6.5 2-6.5 2-2 6.5L8 13l-6.5-2L8 9z" />
      <path fill={W} d="M18.5 13.5 19.5 16.5 22.5 17.5 19.5 18.5 18.5 21.5 17.5 18.5 14.5 17.5 17.5 16.5z" />
    </g>
  ),
  balloon: () => (
    <g>
      <ellipse fill={W} cx="12" cy="9" rx="6.5" ry="7.5" />
      <path fill={W} d="M10.8 16.3h2.4L12 18z" />
      <path {...stroke} d="M12 18c-1.5 1.3 1.5 2.5 0 4" />
    </g>
  ),
  truck: (bg) => (
    <g>
      <rect fill={W} x="1.5" y="5" width="12.5" height="11" rx="1" />
      <path fill={W} d="M14.5 8.5h4l3.5 4V16h-7.5z" />
      <circle fill={W} stroke={bg} strokeWidth={1.5} cx="6" cy="17.5" r="2.5" />
      <circle fill={W} stroke={bg} strokeWidth={1.5} cx="17.5" cy="17.5" r="2.5" />
    </g>
  ),
};

// Primera categoría del proveedor que tenga ícono dibujado.
export function categoryGlyph(
  categories: { icon: string | null }[],
): Glyph | null {
  for (const { icon } of categories) {
    if (icon && GLYPHS[icon]) return GLYPHS[icon];
  }
  return null;
}

export function CategoryIcon({
  glyph,
  bg,
  size,
}: {
  glyph: Glyph;
  bg: string;
  size: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {glyph(bg)}
    </svg>
  );
}
