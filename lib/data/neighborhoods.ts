import { createServerSupabase } from "@/lib/supabase/server";
import type { Neighborhood } from "@/lib/types";

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("id, name, slug")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Neighborhood[];
}
