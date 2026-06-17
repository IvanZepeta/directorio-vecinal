"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { reviewSchema, reviewUpdateSchema } from "@/lib/validations";
import { getCurrentProfile } from "@/lib/data/profiles";
import {
  createReview,
  deleteReview,
  updateReview,
} from "@/lib/data/reviews";
import {
  countProviderPhotos,
  countProviderPhotosByUser,
  deleteProviderPhoto,
  MAX_PHOTOS_PER_USER,
  MAX_PROVIDER_PHOTOS,
  uploadProviderPhoto,
} from "@/lib/data/providers";

export interface ReviewFormState {
  error?: string;
  success?: boolean;
}

export async function createReviewAction(
  _previousState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved") {
    return { error: "Tu cuenta aún no está aprobada para reseñar." };
  }

  const parsed = reviewSchema.safeParse({
    providerId: formData.get("providerId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
    serviceDate: formData.get("serviceDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await createReview({
      providerId: parsed.data.providerId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      serviceDate: parsed.data.serviceDate,
    });
  } catch (err) {
    if ((err as { code?: string })?.code === "23505") {
      return {
        error: "Ya dejaste una reseña para este proveedor. Puedes editarla.",
      };
    }
    return { error: "No se pudo guardar la reseña. Intenta de nuevo." };
  }

  revalidatePath(`/proveedor/${parsed.data.providerId}`);
  return { success: true };
}

export async function updateReviewAction(
  _previousState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved") {
    return { error: "Tu cuenta aún no está aprobada." };
  }

  const parsed = reviewUpdateSchema.safeParse({
    reviewId: formData.get("reviewId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
    serviceDate: formData.get("serviceDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    // RLS garantiza que solo el autor puede actualizar su reseña
    await updateReview({
      reviewId: parsed.data.reviewId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      serviceDate: parsed.data.serviceDate,
    });
  } catch {
    return { error: "No se pudo actualizar la reseña. Intenta de nuevo." };
  }

  revalidatePath(`/proveedor/${formData.get("providerId")}`);
  return { success: true };
}

export async function deleteReviewAction(formData: FormData) {
  const reviewId = z.uuid().safeParse(formData.get("reviewId"));
  if (!reviewId.success) return;

  // RLS garantiza que solo el autor (o un admin) puede eliminar
  await deleteReview(reviewId.data);
  revalidatePath(`/proveedor/${formData.get("providerId")}`);
}

export interface PhotoUploadState {
  error?: string;
  success?: boolean;
}

export async function addPhotosAction(
  _previousState: PhotoUploadState,
  formData: FormData,
): Promise<PhotoUploadState> {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "approved") {
    return { error: "Tu cuenta aún no está aprobada." };
  }

  const providerId = z.uuid().safeParse(formData.get("providerId"));
  if (!providerId.success) {
    return { error: "Proveedor inválido." };
  }

  const photos = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (photos.length === 0) {
    return { error: "Elige al menos una foto." };
  }

  const [total, mine] = await Promise.all([
    countProviderPhotos(providerId.data),
    countProviderPhotosByUser(providerId.data, profile.id),
  ]);

  if (total >= MAX_PROVIDER_PHOTOS) {
    return {
      error: `Este proveedor ya tiene el máximo de ${MAX_PROVIDER_PHOTOS} fotos. Elimina alguna para agregar otra.`,
    };
  }
  if (mine >= MAX_PHOTOS_PER_USER) {
    return {
      error: `Ya subiste tus ${MAX_PHOTOS_PER_USER} fotos para este proveedor.`,
    };
  }

  // Cabe lo menor entre: cupo del proveedor, cupo del vecino, y lo que eligió.
  const allowed = Math.min(
    MAX_PROVIDER_PHOTOS - total,
    MAX_PHOTOS_PER_USER - mine,
  );

  try {
    for (const photo of photos.slice(0, allowed)) {
      await uploadProviderPhoto(providerId.data, photo);
    }
  } catch {
    return { error: "No se pudieron subir las fotos. Intenta de nuevo." };
  }

  revalidatePath(`/proveedor/${providerId.data}`);
  return { success: true };
}

export async function deletePhotoAction(formData: FormData) {
  const photoId = z.uuid().safeParse(formData.get("photoId"));
  if (!photoId.success) return;

  // RLS garantiza que solo quien la subió (o un admin) puede eliminarla
  await deleteProviderPhoto(photoId.data);
  revalidatePath(`/proveedor/${formData.get("providerId")}`);
}
