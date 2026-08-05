import { createServerSupabase } from "@/lib/supabase/server";
import type { Category, Provider, ProviderPhoto, Review } from "@/lib/types";

// El listado nunca muestra autor de foto ni de reseña: pide solo lo seguro.
const SUMMARY_SELECT =
  "*, provider_categories!inner(category_id, categories(id, name, icon)), provider_photos(id, url), reviews(rating)";

// Columnas de autor: `anon` no puede leerlas (revocadas en 0006), así que solo
// se piden cuando hay sesión. Sin sesión se usan las iniciales precalculadas.
const REVIEW_PUBLIC =
  "id, rating, comment, service_date, status, created_at, author_initials";
const REVIEW_PRIVATE = `${REVIEW_PUBLIC}, user_id, author_name`;
const PHOTO_PUBLIC = "id, url";
const PHOTO_PRIVATE = `${PHOTO_PUBLIC}, uploaded_by, author_name`;

function detailSelect(includePrivate: boolean): string {
  const reviews = includePrivate ? REVIEW_PRIVATE : REVIEW_PUBLIC;
  const photos = includePrivate ? PHOTO_PRIVATE : PHOTO_PUBLIC;
  return `*, provider_categories(category_id, categories(id, name, icon)), provider_photos(${photos}), reviews(${reviews})`;
}

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

// includePrivate = hay sesión. Sin sesión NO se piden columnas de autor
// (para `anon` están revocadas y la query fallaría de pedirlas).
export async function getProvider(
  id: string,
  includePrivate = false,
): Promise<Provider | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("providers")
    .select(detailSelect(includePrivate))
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

// Segunda línea de defensa del lado del servidor: la compresión a WebP vive en
// el cliente (compress-image.ts) y se puede saltar llamando la server action
// directo. Aquí validamos tipo y tamaño reales antes de escribir al bucket
// público, para que nadie suba HTML/SVG/ejecutables ni archivos gigantes.
const ALLOWED_PHOTO_TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};
// El cliente comprime a ~250 KB; 2 MB deja holgura sin abrir la puerta a abuso.
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

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

  // Rechaza cualquier archivo que no sea una imagen permitida o que exceda el
  // tope de tamaño, ANTES de escribirlo al bucket público.
  const extension = ALLOWED_PHOTO_TYPES[file.type];
  if (!extension) {
    throw new Error("Formato no permitido: solo JPG, PNG o WebP.");
  }
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error("La foto es demasiado grande.");
  }

  const path = `providers/${providerId}/${crypto.randomUUID()}.${extension}`;

  // contentType explícito: el archivo se sirve con el tipo que validamos, no
  // con uno que el cliente pudiera falsear.
  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(path);

  const { error } = await supabase
    .from("provider_photos")
    .insert({ provider_id: providerId, url: publicUrl });
  if (error) throw error;
}
