import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/config";
import { getCurrentProfile, getSession } from "@/lib/data/profiles";
import { MainNav } from "@/components/main-nav";

export async function Header() {
  const configured = isSupabaseConfigured();
  const session = configured ? await getSession() : null;
  const profile = session ? await getCurrentProfile() : null;

  return (
    <header className="relative border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-base font-semibold sm:text-lg">
          🏘️ Directorio vecinal
        </Link>

        <MainNav
          configured={configured}
          hasSession={!!session}
          hasProfile={!!profile}
          isApproved={profile?.status === "approved"}
          isPending={profile?.status === "pending"}
          isAdmin={profile?.is_admin ?? false}
        />
      </div>
    </header>
  );
}
