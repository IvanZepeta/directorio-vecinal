import type { NextConfig } from "next";

// Origen de Supabase (fotos públicas + REST/Auth) para acotar la CSP. Si no
// está en el entorno al construir, se cae a un comodín de *.supabase.co.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
let supabaseOrigin = "https://*.supabase.co";
try {
  if (supabaseUrl) supabaseOrigin = new URL(supabaseUrl).origin;
} catch {
  // URL inválida: nos quedamos con el comodín.
}

// CSP pragmática (defensa en profundidad, la app no tiene sinks de XSS):
// - script/style 'unsafe-inline' porque Next inyecta scripts/estilos inline sin
//   nonce; aun así se bloquea cargar scripts de orígenes externos.
// - conexiones e imágenes acotadas a 'self' + el proyecto de Supabase.
// - frame-ancestors/object/base cerrados: anti-clickjacking e inyección de base.
// Endurecimiento futuro: CSP con nonce por middleware para quitar 'unsafe-inline'.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  `img-src 'self' data: blob: ${supabaseOrigin}`,
  `connect-src 'self' ${supabaseOrigin} ${supabaseOrigin.replace("https://", "wss://")}`,
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Las fotos se comprimen a ~250 KB en el cliente (compress-image.ts) y se
      // validan en el servidor (providers.ts). 3 MB cubre 4 fotos por subida con
      // holgura y acota el cuerpo aceptado (antes 8 MB).
      bodySizeLimit: "3mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
