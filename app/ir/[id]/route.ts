import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { trackWhatsAppClick } from "@/lib/data/clicks";

const GREETING =
  "¡Hola! Vi tu perfil en el directorio del fraccionamiento y me interesa tu servicio.";

// El sitio es indexable a propósito, así que los buscadores siguen el enlace de
// "Contactar por WhatsApp" y cada pasada contaría como un click que nadie hizo.
// Los bots honestos se anuncian en el User-Agent; a esos los redirigimos igual
// pero no los contamos. Es una heurística para limpiar la métrica de tráfico
// automatizado, no un control de seguridad: el User-Agent lo elige quien pide.
const BOT_AGENT =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|discord|preview|monitor|headless|lighthouse|curl|wget|python-requests|axios|go-http/i;

function isBot(request: Request): boolean {
  const agent = request.headers.get("user-agent");
  // Sin User-Agent no es un navegador: un vecino real siempre manda uno.
  return !agent || BOT_AGENT.test(agent);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const { data: provider } = await supabase
    .from("providers")
    .select("whatsapp")
    .eq("id", id)
    .maybeSingle();

  if (!provider) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isBot(request)) {
    await trackWhatsAppClick(id);
  }

  const url = `https://wa.me/52${provider.whatsapp}?text=${encodeURIComponent(GREETING)}`;
  return NextResponse.redirect(url);
}
