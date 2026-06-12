import { createServerSupabase } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getSession() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data as Profile | null;
}

export async function createProfile(input: {
  name: string;
  phone: string;
  street: string;
  neighborhoodId: string;
}): Promise<void> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    neighborhood_id: input.neighborhoodId,
    name: input.name,
    phone: input.phone,
    street: input.street,
  });
  if (error) throw error;
}

export async function getPendingProfiles(): Promise<Profile[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "pending")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function setProfileStatus(
  profileId: string,
  status: "approved" | "blocked",
): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", profileId);
  if (error) throw error;
}
