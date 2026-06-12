import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { getCurrentProfile, getSession } from "@/lib/data/profiles";
import { getNeighborhoods } from "@/lib/data/neighborhoods";
import { SignupForm } from "@/components/signup-form";
import { SetupNotice } from "@/components/setup-notice";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await getCurrentProfile();
  if (profile) redirect("/");

  const neighborhoods = await getNeighborhoods();

  return (
    <div className="mx-auto max-w-md space-y-4 py-8">
      <h1 className="text-2xl font-semibold">Completa tu registro</h1>
      <p className="text-sm text-zinc-500">
        Solo vecinos verificados pueden recomendar y reseñar. Cuéntanos
        quién eres:
      </p>
      <SignupForm neighborhoods={neighborhoods} />
    </div>
  );
}
