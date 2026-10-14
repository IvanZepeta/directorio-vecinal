import { ImageResponse } from "next/og";
import { avatarHex, avatarInitial } from "@/lib/avatar";
import { descriptionExcerpt, SITE_NAME } from "@/lib/share";
import type { Provider } from "@/lib/types";

// Imagen de preview al compartir (1200×630, lo que piden WhatsApp/Facebook).
// next/og dibuja con satori: estilos inline, flex explícito en todo contenedor
// con varios hijos, y sin clases de Tailwind.

export const OG_SIZE = { width: 1200, height: 630 };

// ImageResponse trae por defecto `immutable, max-age=31536000`: la imagen de
// una ficha que se oculta, se borra o cambia de nombre seguiría sirviéndose
// cacheada un año desde nuestra propia CDN. Una hora basta para los crawlers.
const OPTIONS = {
  ...OG_SIZE,
  headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
};

const EMERALD = "#059669";
const ZINC_900 = "#18181b";
const ZINC_500 = "#71717a";

// La fuente por defecto de next/og (Geist) no trae "★": se dibuja en SVG.
function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24">
      <path
        fill={filled ? "#f59e0b" : "#d4d4d8"}
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
      />
    </svg>
  );
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width="48" height="48" viewBox="0 0 32 32">
        <rect width="32" height="32" rx="7" fill={EMERALD} />
        <path fill="#fff" d="M16 6.2 27 15.6h-3.1V26H8.1V15.6H5z" />
      </svg>
      <span style={{ fontSize: 32, color: ZINC_900 }}>{SITE_NAME}</span>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: "#fafafa",
        borderLeft: `24px solid ${EMERALD}`,
      }}
    >
      {children}
    </div>
  );
}

// Para la home, las demás páginas y cualquier ficha que no se pueda mostrar
// (oculta o inexistente): no revela si el proveedor existe.
export function brandImage() {
  return new ImageResponse(
    (
      <Frame>
        <Brand />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 72, color: ZINC_900, lineHeight: 1.1 }}>
            Proveedores recomendados por tus vecinos
          </span>
          <span style={{ fontSize: 36, color: ZINC_500 }}>
            Plomeros, electricistas, comida, eventos y más, calificados por
            quienes ya los contrataron.
          </span>
        </div>
        <div style={{ display: "flex" }} />
      </Frame>
    ),
    OPTIONS,
  );
}

const clip = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export function providerImage(provider: Provider) {
  const rounded = Math.round(provider.average_rating ?? 0);
  const excerpt = descriptionExcerpt(provider.description, 110);

  return new ImageResponse(
    (
      <Frame>
        <Brand />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                background: avatarHex(provider.name),
                color: "#fff",
                fontSize: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {avatarInitial(provider.name)}
            </div>
            <span style={{ fontSize: 64, color: ZINC_900, lineHeight: 1.1 }}>
              {clip(provider.name, 48)}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {provider.categories.slice(0, 4).map((category) => (
              <span
                key={category.id}
                style={{
                  fontSize: 28,
                  color: "#047857",
                  background: "#ecfdf5",
                  borderRadius: 999,
                  padding: "6px 20px",
                }}
              >
                {category.name}
              </span>
            ))}
          </div>
          {excerpt && (
            <span style={{ fontSize: 30, color: ZINC_500 }}>{excerpt}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {provider.review_count > 0 ? (
            <>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} filled={n <= rounded} />
              ))}
              <span style={{ fontSize: 30, color: ZINC_500, marginLeft: 12 }}>
                {`${provider.average_rating!.toFixed(1)} · ${provider.review_count} reseña${provider.review_count === 1 ? "" : "s"} de vecinos`}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 30, color: ZINC_500 }}>
              Recomendado por vecinos · aún sin reseñas
            </span>
          )}
        </div>
      </Frame>
    ),
    OPTIONS,
  );
}
