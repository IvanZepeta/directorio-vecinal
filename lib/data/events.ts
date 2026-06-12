import { createServerSupabase } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export async function getUpcomingEvents(): Promise<Event[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at");
  if (error) throw error;
  return (data ?? []) as Event[];
}
