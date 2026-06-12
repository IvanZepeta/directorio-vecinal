import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { getProvider } from "@/lib/data/providers";
import { getCurrentProfile } from "@/lib/data/profiles";
import { getCategories } from "@/lib/data/categories";
import { ProviderEditForm } from "@/components/provider-edit-form";
import { SetupNotice } from "@/components/setup-notice";

export const dynamic = "force-dynamic";

export default async function EditProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const { id } = await params;
  const [provider, profile] = await Promise.all([
    getProvider(id),
    getCurrentProfile(),
  ]);
  if (!provider) notFound();

  const canEdit =
    profile?.status === "approved" &&
    (provider.created_by === profile.id || profile.is_admin);
  if (!canEdit) notFound();

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Editar a {provider.name}</h1>
      <p className="text-sm text-zinc-500">
        Las fotos se agregan desde la ficha; las reseñas son de cada vecino.
      </p>
      <ProviderEditForm provider={provider} categories={categories} />
    </div>
  );
}
