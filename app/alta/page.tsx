import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/config";
import { getCategories } from "@/lib/data/categories";
import { getCurrentProfile } from "@/lib/data/profiles";
import { ProviderForm } from "@/components/provider-form";
import { SetupNotice } from "@/components/setup-notice";

export const dynamic = "force-dynamic";

export default async function NewProviderPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <p className="py-12 text-center text-zinc-500">
        <Link href="/login" className="text-emerald-600 underline">
          Entra con tu correo
        </Link>{" "}
        para recomendar un proveedor.
      </p>
    );
  }

  if (profile.status !== "approved") {
    return (
      <p className="py-12 text-center text-zinc-500">
        Tu cuenta está en revisión. Podrás recomendar proveedores en cuanto
        un administrador la apruebe.
      </p>
    );
  }

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Recomendar un proveedor</h1>
      <p className="text-sm text-zinc-500">
        ¿Te hizo buen trabajo? Compártelo para que no se pierda en el chat.
      </p>
      <ProviderForm categories={categories} />
    </div>
  );
}
