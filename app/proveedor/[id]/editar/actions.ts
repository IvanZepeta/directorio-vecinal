"use server";

import { redirect } from "next/navigation";
import { providerUpdateSchema } from "@/lib/validations";
import { getCurrentProfile } from "@/lib/data/profiles";
import { getProvider, updateProvider } from "@/lib/data/providers";

export interface ProviderEditState {
  error?: string;
}

export async function updateProviderAction(
  _previousState: ProviderEditState,
  formData: FormData,
): Promise<ProviderEditState> {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved") {
    return { error: "Tu cuenta aún no está aprobada." };
  }

  const parsed = providerUpdateSchema.safeParse({
    providerId: formData.get("providerId"),
    name: formData.get("name"),
    whatsapp: formData.get("whatsapp"),
    description: formData.get("description"),
    areas: formData.get("areas"),
    categories: formData.getAll("categories"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const provider = await getProvider(parsed.data.providerId);
  if (!provider) {
    return { error: "Proveedor no encontrado." };
  }
  if (provider.created_by !== profile.id && !profile.is_admin) {
    return { error: "Solo quien lo recomendó puede editarlo." };
  }

  try {
    await updateProvider({
      providerId: parsed.data.providerId,
      name: parsed.data.name,
      whatsapp: parsed.data.whatsapp,
      description: parsed.data.description,
      areas: parsed.data.areas,
      categories: parsed.data.categories,
    });
  } catch {
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  redirect(`/proveedor/${parsed.data.providerId}`);
}
