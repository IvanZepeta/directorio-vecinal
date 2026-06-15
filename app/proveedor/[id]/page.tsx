import Link from "next/link";
import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { getProvider } from "@/lib/data/providers";
import { getCurrentProfile, getSession } from "@/lib/data/profiles";
import { formatPhone } from "@/lib/format";
import { StarRating } from "@/components/star-rating";
import { Avatar } from "@/components/avatar";
import { ReviewForm } from "@/components/review-form";
import { ReviewItem } from "@/components/review-item";
import { PhotoUploadForm } from "@/components/photo-upload-form";
import { PhotoGallery } from "@/components/photo-gallery";
import { SetupNotice } from "@/components/setup-notice";

export const dynamic = "force-dynamic";

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const { id } = await params;
  const [provider, profile, session] = await Promise.all([
    getProvider(id),
    getCurrentProfile(),
    getSession(),
  ]);
  if (!provider) notFound();

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
          <p className="text-zinc-600 dark:text-zinc-400">
            {provider.description}
          </p>
        )}
        {provider.areas && (
          <p className="text-sm text-zinc-500">
            📍 Trabaja en: {provider.areas}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={`/ir/${provider.id}`}
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
      </section>

      {(provider.photos.length > 0 || profile?.status === "approved") && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Fotos de sus trabajos</h2>
          {provider.photos.length > 0 && (
            <PhotoGallery
              photos={provider.photos}
              providerId={provider.id}
              providerName={provider.name}
              viewerId={profile?.status === "approved" ? profile.id : null}
              isAdmin={profile?.is_admin ?? false}
              canSeeAuthor={!!session}
            />
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

        {provider.reviews.map((review) => (
          <ReviewItem
            key={review.id}
            review={review}
            providerId={provider.id}
            canEdit={
              profile?.status === "approved" && review.user_id === profile.id
            }
            canSeeAuthor={!!session}
          />
        ))}

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 font-medium">Deja tu reseña</h3>
          {profile?.status === "approved" ? (
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
      </section>
    </div>
  );
}
