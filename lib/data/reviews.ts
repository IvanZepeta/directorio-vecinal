import { createServerSupabase } from "@/lib/supabase/server";

export async function createReview(input: {
  providerId: string;
  rating: number;
  comment?: string;
  serviceDate?: string;
}): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("reviews").insert({
    provider_id: input.providerId,
    rating: input.rating,
    comment: input.comment || null,
    service_date: input.serviceDate || null,
  });
  if (error) throw error;
}

export async function updateReview(input: {
  reviewId: string;
  rating: number;
  comment?: string;
  serviceDate?: string;
}): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("reviews")
    .update({
      rating: input.rating,
      comment: input.comment || null,
      service_date: input.serviceDate || null,
    })
    .eq("id", input.reviewId);
  if (error) throw error;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);
  if (error) throw error;
}
