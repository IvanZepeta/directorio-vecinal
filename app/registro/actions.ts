"use server";

import { redirect } from "next/navigation";
import { fieldErrorsFrom, profileSchema } from "@/lib/validations";
import { createProfile, getSession } from "@/lib/data/profiles";

export interface SignupFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createProfileAction(
  _previousState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const session = await getSession();
  if (!session) {
    return { error: "Tu sesión expiró. Vuelve a entrar con tu correo." };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    street: formData.get("street"),
    neighborhoodId: formData.get("neighborhoodId"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  try {
    await createProfile(parsed.data);
  } catch {
    return { error: "No se pudo guardar tu registro. Intenta de nuevo." };
  }

  redirect("/");
}
