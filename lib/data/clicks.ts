import { createServerSupabase } from "@/lib/supabase/server";

export async function trackWhatsAppClick(providerId: string): Promise<void> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("whatsapp_clicks").insert({
    provider_id: providerId,
    user_id: user?.id ?? null,
  });
  if (error) {
    console.error("Could not track click:", error.message);
  }
}
