import { isSupabaseConfigured } from "@/lib/config";
import { getProvider } from "@/lib/data/providers";
import { brandImage, OG_SIZE, providerImage } from "@/lib/og";

export const alt = "Ficha del proveedor en el Directorio vecinal";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) return brandImage();

  const { id } = await params;
  // Siempre la variante pública (sin columnas de autor): la imagen la piden
  // los crawlers de WhatsApp/Facebook sin sesión y queda cacheada afuera.
  // Un id que no es uuid hace fallar la query: se trata como inexistente.
  const provider = await getProvider(id, false).catch(() => null);
  // Se exige `active` aunque la RLS ya filtra: con sesión de admin la RLS SÍ
  // devuelve fichas ocultas, y esta respuesta se cachea en la CDN sin
  // distinguir quién la pidió. Oculto o inexistente = 404, igual que la ficha,
  // y sin gastar un render por cada id inventado.
  if (provider?.status !== "active") {
    return new Response(null, { status: 404 });
  }
  return providerImage(provider);
}
