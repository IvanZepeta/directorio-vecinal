export type ProfileStatus = "pending" | "approved" | "blocked";
export type ProviderStatus = "active" | "hidden";
export type ReviewStatus = "visible" | "hidden";

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export interface ProviderPhoto {
  id: string;
  url: string;
  // Solo presentes con sesión: para `anon` están revocados a nivel de columna
  // (migración 0006), así que no viajan en la respuesta de la API.
  uploaded_by?: string;
  author_name?: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  service_date: string | null;
  status: ReviewStatus;
  created_at: string;
  // Iniciales precalculadas: es lo único de autor visible sin sesión.
  author_initials: string;
  // Solo presentes con sesión (revocados para `anon` en 0006).
  user_id?: string;
  author_name?: string | null;
}

// Formas "seguras para el cliente": ya enmascaradas y sin identificadores
// internos (user_id / uploaded_by). Es lo ÚNICO de reseñas/fotos que cruza a
// componentes "use client": sin sesión, el nombre completo y el UUID del autor
// nunca deben viajar en el payload (privacidad de vecinos en página pública).
export interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  service_date: string | null;
  author_label: string;
}

export interface PublicPhoto {
  id: string;
  url: string;
  author_label: string | null;
  can_delete: boolean;
}

export interface Provider {
  id: string;
  created_by: string;
  name: string;
  description: string | null;
  whatsapp: string;
  areas: string | null;
  status: ProviderStatus;
  created_at: string;
  categories: Category[];
  photos: ProviderPhoto[];
  reviews: Review[];
  average_rating: number | null;
  review_count: number;
}

export interface Profile {
  id: string;
  neighborhood_id: string;
  name: string;
  phone: string;
  street: string;
  status: ProfileStatus;
  is_admin: boolean;
}

export interface Event {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
}

export interface Report {
  id: string;
  type: "review" | "provider";
  target_id: string;
  reason: string;
  resolved: boolean;
  created_at: string;
}
