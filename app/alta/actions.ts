"use server";

import { redirect } from "next/navigation";
import { providerSchema } from "@/lib/validations";
import { getCurrentProfile } from "@/lib/data/profiles";
import { createProvider, uploadProviderPhoto } from "@/lib/data/providers";

export interface ProviderFormState {
  error?: string;
}

export async function createProviderAction(
  _previousState: ProviderFormState,
  formData: FormData,
): Promise<ProviderFormState> {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved") {
    return { error: "Tu cuenta aún no está aprobada." };
  }

  const parsed = providerSchema.safeParse({
    name: formData.get("name"),
    whatsapp: formData.get("whatsapp"),
    description: formData.get("description"),
    areas: formData.get("areas"),
    categories: formData.getAll("categories"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let providerId: string;
  try {
    providerId = await createProvider({
      name: parsed.data.name,
      whatsapp: parsed.data.whatsapp,
      description: parsed.data.description,
      areas: parsed.data.areas,
      categories: parsed.data.categories,
    });

    const photos = formData
      .getAll("photos")
      .filter((f): f is File => f instanceof File && f.size > 0);
    for (const photo of photos.slice(0, 5)) {
      await uploadProviderPhoto(providerId, photo);
    }
  } catch {
    return { error: "No se pudo guardar el proveedor. Intenta de nuevo." };
  }

  redirect(`/proveedor/${providerId}`);
}
