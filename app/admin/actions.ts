"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile, setProfileStatus } from "@/lib/data/profiles";

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) throw new Error("Admins only");
}

export async function approveProfileAction(formData: FormData) {
  await requireAdmin();
  await setProfileStatus(String(formData.get("profileId")), "approved");
  revalidatePath("/admin");
}

export async function blockProfileAction(formData: FormData) {
  await requireAdmin();
  await setProfileStatus(String(formData.get("profileId")), "blocked");
  revalidatePath("/admin");
}
