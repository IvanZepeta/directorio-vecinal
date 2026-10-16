import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { getProvider } from "@/lib/data/providers";
import { getCurrentProfile, getSession } from "@/lib/data/profiles";
import { authorDisplay, formatPhone } from "@/lib/format";
import { shareDescription, SITE_NAME } from "@/lib/share";
import { StarRating } from "@/components/star-rating";
import { Avatar } from "@/components/avatar";
import { ReviewForm } from "@/components/review-form";
import { ReviewItem } from "@/components/review-item";
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { PhotoGallery } from "@/components/photo-gallery";
import { ProviderDescription } from "@/components/provider-description";
import {
  galleryLinks,
  PhotosElsewhere,
  ProviderLinks,
} from "@/components/provider-links";
import { SetupNotice } from "@/components/setup-notice";

export const dynamic = "force-dynamic";

// Variante pública memoizada por request: generateMetadata y la página sin
// sesión (el caso de los crawlers al compartir) comparten una sola query.
const getPublicProvider = cache((id: string) => getProvider(id, false));

// Preview al compartir. Solo datos públicos y sin teléfono (ver lib/share.ts).
// La imagen la pone opengraph-image.tsx de esta misma carpeta.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  if (!isSupabaseConfigured()) return {};
  const { id } = await params;
  // Si la query falla (id que no es uuid, BD caída) el preview no debe tumbar
  // nada: se queda el genérico y la página decide qué mostrar.
  const provider = await getPublicProvider(id).catch(() => null);
  // Oculto o inexistente: se queda el preview genérico del layout. Se exige
  // `active` porque con sesión de admin la RLS sí devuelve fichas ocultas.
  if (provider?.status !== "active") return {};

  const title = `${provider.name} · ${SITE_NAME}`;
  const description = shareDescription(provider);
  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const { id } = await params;
  const [profile, session] = await Promise.all([
    getCurrentProfile(),
    getSession(),
  ]);
  // Con sesión traemos las columnas de autor; sin sesión ni se piden.
  const provider = session
    ? await getProvider(id, true)
    : await getPublicProvider(id);
  if (!provider) notFound();

  const isApproved = profile?.status === "approved";
  const canSeeAuthor = !!session;
  const alreadyReviewed =
    !!profile && provider.reviews.some((r) => r.user_id === profile.id);

  // Sanitiza en el servidor lo que se pasa a componentes cliente: el nombre
  // completo y el user_id/uploaded_by NO deben serializarse en el payload si el
  // visitante no tiene sesión. El enmascarado ya no vive en el cliente.
  const publicReviews = provider.reviews.map((r) => ({
    review: {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      service_date: r.service_date,
      author_label: canSeeAuthor
        ? authorDisplay(r.author_name ?? null, true)
        : r.author_initials,
    },
    canEdit: isApproved && r.user_id === profile!.id,
  }));

  const publicPhotos = provider.photos.map((p) => ({
    id: p.id,
    url: p.url,
    author_label: canSeeAuthor ? authorDisplay(p.author_name ?? null, true) : null,
    can_delete:
      isApproved && (p.uploaded_by === profile!.id || !!profile?.is_admin),
  }));

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={provider.name} className="h-14 w-14 text-xl" />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{provider.name}</h1>
            <div className="flex items-center gap-2">
              <StarRating value={provider.average_rating} className="text-sm" />
              {provider.review_count > 0 && (
                <span className="text-sm text-zinc-500">
                  ({provider.review_count} reseña
                  {provider.review_count === 1 ? "" : "s"})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {provider.categories.map((category) => (
            <span
              key={category.id}
              className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {category.name}
            </span>
          ))}
        </div>

        {provider.description && (
          <ProviderDescription text={provider.description} />
        )}
        {provider.areas && (
          <p className="text-sm text-zinc-500">
            📍 Trabaja en: {provider.areas}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={`/ir/${provider.id}`}
            rel="nofollow"
            className="inline-block rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700"
          >
            💬 Contactar por WhatsApp
          </a>
          <a
            href={`tel:+52${provider.whatsapp}`}
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-300"
          >
            📞 {formatPhone(provider.whatsapp)}
          </a>
          {profile?.status === "approved" &&
            (provider.created_by === profile.id || profile.is_admin) && (
              <Link
                href={`/proveedor/${provider.id}/editar`}
                className="text-sm text-emerald-600 hover:underline"
              >
                ✏️ Editar datos
              </Link>
            )}
        </div>
        <ProviderLinks links={provider.links} />
      </section>

      {(provider.photos.length > 0 ||
        galleryLinks(provider.links).length > 0 ||
        profile?.status === "approved") && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Fotos de sus trabajos</h2>
          {provider.photos.length > 0 ? (
            <PhotoGallery
              photos={publicPhotos}
              providerId={provider.id}
              providerName={provider.name}
            />
          ) : (
            <PhotosElsewhere links={provider.links} />
          )}
          {profile?.status === "approved" && (
            <PhotoUploadForm providerId={provider.id} />
          )}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Reseñas de vecinos</h2>

        {provider.reviews.length === 0 && (
          <p className="text-sm text-zinc-500">
            Nadie lo ha reseñado todavía.
          </p>
        )}

        {publicReviews.map(({ review, canEdit }) => (
          <ReviewItem
            key={review.id}
            review={review}
            providerId={provider.id}
            canEdit={canEdit}
          />
        ))}

        {isApproved && alreadyReviewed ? (
          <p className="text-sm text-zinc-500">
            Ya dejaste tu reseña para este proveedor. Puedes editarla arriba.
          </p>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-3 font-medium">Deja tu reseña</h3>
            {isApproved ? (
              <ReviewForm providerId={provider.id} />
            ) : profile?.status === "pending" ? (
              <p className="text-sm text-zinc-500">
                Tu cuenta está en revisión. Podrás reseñar en cuanto un
                administrador la apruebe.
              </p>
            ) : (
              <p className="text-sm text-zinc-500">
                <Link href="/login" className="text-emerald-600 underline">
                  Entra con tu correo
                </Link>{" "}
                para dejar una reseña (solo vecinos verificados).
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
