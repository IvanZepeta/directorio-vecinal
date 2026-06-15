import { createServerSupabase } from "@/lib/supabase/server";
import type { Category, Provider, ProviderPhoto, Review } from "@/lib/types";

const SUMMARY_SELECT =
  "*, provider_categories!inner(category_id, categories(id, name, icon)), provider_photos(id, url, uploaded_by, author_name), reviews(rating)";

const DETAIL_SELECT =
  "*, provider_categories(category_id, categories(id, name, icon)), provider_photos(id, url, uploaded_by, author_name), reviews(id, user_id, rating, comment, service_date, author_name, status, created_at)";

interface ProviderRow {
  id: string;
  created_by: string;
  name: string;
  description: string | null;
  whatsapp: string;
  areas: string | null;
  status: "active" | "hidden";
  created_at: string;
  provider_categories: { categories: Category | null }[];
  provider_photos: ProviderPhoto[];
  reviews: Partial<Review>[];
}

function mapProvider(row: ProviderRow): Provider {
  const reviews = (row.reviews ?? []).filter(
    (r) => r.status === undefined || r.status === "visible",
  ) as Review[];
  const count = reviews.length;
  const average = count
    ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / count
    : null;

  return {
    id: row.id,
    created_by: row.created_by,
    name: row.name,
    description: row.description,
    whatsapp: row.whatsapp,
    areas: row.areas,
    status: row.status,
    created_at: row.created_at,
    categories: (row.provider_categories ?? [])
      .map((pc) => pc.categories)
      .filter((c): c is Category => c !== null),
    photos: row.provider_photos ?? [],
    reviews,
    average_rating: average,
    review_count: count,
  };
}

// Quita acentos y pasa a minúsculas para una búsqueda tolerante
// ("fumigacion" encuentra "Fumigación").
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(DIACRITICS, "");
}

export async function getProviders(
  filters: { categoryId?: string; search?: string } = {},
): Promise<Provider[]> {
  const supabase = await createServerSupabase();

  // A escala de un fraccionamiento (decenas de proveedores) traemos los
  // activos y filtramos en memoria: permite buscar también en categorías
  // y descripción, y conserva todas las categorías de cada proveedor.
  const { data, error } = await supabase
    .from("providers")
    .select(SUMMARY_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;

  let providers = (data as unknown as ProviderRow[]).map(mapProvider);

  if (filters.categoryId) {
    providers = providers.filter((p) =>
      p.categories.some((c) => c.id === filters.categoryId),
    );
  }

  if (filters.search?.trim()) {
    const term = normalize(filters.search);
    providers = providers.filter((p) => {
      const haystack = normalize(
        [
          p.name,
          p.description ?? "",
          p.areas ?? "",
          p.whatsapp,
          ...p.categories.map((c) => c.name),
        ].join(" "),
      );
      // Para teléfonos: comparar también solo dígitos (ignora espacios)
      const digits = term.replace(/\D/g, "");
      return (
        haystack.includes(term) ||
        (digits.length >= 3 && p.whatsapp.includes(digits))
      );
    });
  }

  return providers;
}

export async function getProvider(id: string): Promise<Provider | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("providers")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const provider = mapProvider(data as unknown as ProviderRow);
  provider.reviews.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return provider;
}

export async function createProvider(input: {
  name: string;
  whatsapp: string;
  description?: string;
  areas?: string;
  categories: string[];
}): Promise<string> {
  const supabase = await createServerSupabase();

  const { data: provider, error } = await supabase
    .from("providers")
    .insert({
      name: input.name,
      whatsapp: input.whatsapp,
      description: input.description || null,
      areas: input.areas || null,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: categoriesError } = await supabase
    .from("provider_categories")
    .insert(
      input.categories.map((categoryId) => ({
        provider_id: provider.id,
        category_id: categoryId,
      })),
    );
  if (categoriesError) throw categoriesError;

  return provider.id;
}

export async function updateProvider(input: {
  providerId: string;
  name: string;
  whatsapp: string;
  description?: string;
  areas?: string;
  categories: string[];
}): Promise<void> {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from("providers")
    .update({
      name: input.name,
      whatsapp: input.whatsapp,
      description: input.description || null,
      areas: input.areas || null,
    })
    .eq("id", input.providerId);
  if (error) throw error;

  const { error: deleteError } = await supabase
    .from("provider_categories")
    .delete()
    .eq("provider_id", input.providerId);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase
    .from("provider_categories")
    .insert(
      input.categories.map((categoryId) => ({
        provider_id: input.providerId,
        category_id: categoryId,
      })),
    );
  if (insertError) throw insertError;
}

// Tope total de fotos por proveedor (entre todos los vecinos que aportan).
export const MAX_PROVIDER_PHOTOS = 12;
// Tope por vecino en un mismo proveedor (fomenta diversidad, evita monopolio).
export const MAX_PHOTOS_PER_USER = 4;

export async function countProviderPhotos(
  providerId: string,
): Promise<number> {
  const supabase = await createServerSupabase();
  const { count, error } = await supabase
    .from("provider_photos")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", providerId);
  if (error) throw error;
  return count ?? 0;
}

export async function countProviderPhotosByUser(
  providerId: string,
  userId: string,
): Promise<number> {
  const supabase = await createServerSupabase();
  const { count, error } = await supabase
    .from("provider_photos")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", providerId)
    .eq("uploaded_by", userId);
  if (error) throw error;
  return count ?? 0;
}

export async function deleteProviderPhoto(photoId: string): Promise<void> {
  const supabase = await createServerSupabase();

  const { data: photo, error: fetchError } = await supabase
    .from("provider_photos")
    .select("url")
    .eq("id", photoId)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!photo) return;

  const { error } = await supabase
    .from("provider_photos")
    .delete()
    .eq("id", photoId);
  if (error) throw error;

  // Best effort: limpia también el archivo del bucket
  const path = photo.url.split("/photos/")[1];
  if (path) {
    await supabase.storage.from("photos").remove([path]);
  }
}

export async function uploadProviderPhoto(
  providerId: string,
  file: File,
): Promise<void> {
  const supabase = await createServerSupabase();
  // La extensión sale del tipo real ("image/webp" → "webp"), no del nombre
  // original, porque la compresión convierte la foto a WebP.
  const extension = file.type.split("/")[1] || "jpg";
  const path = `providers/${providerId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(path, file);
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(path);

  const { error } = await supabase
    .from("provider_photos")
    .insert({ provider_id: providerId, url: publicUrl });
  if (error) throw error;
}
