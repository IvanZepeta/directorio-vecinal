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
  uploaded_by: string;
  author_name: string | null;
}

export interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  service_date: string | null;
  author_name: string | null;
  status: ReviewStatus;
  created_at: string;
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
