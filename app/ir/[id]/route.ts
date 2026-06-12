import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { trackWhatsAppClick } from "@/lib/data/clicks";

const GREETING =
  "¡Hola! Vi tu perfil en el directorio del fraccionamiento y me interesa tu servicio.";

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

  await trackWhatsAppClick(id);

  const url = `https://wa.me/52${provider.whatsapp}?text=${encodeURIComponent(GREETING)}`;
  return NextResponse.redirect(url);
}
