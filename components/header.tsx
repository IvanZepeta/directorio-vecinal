import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/config";
import { getCurrentProfile, getSession } from "@/lib/data/profiles";
import { signOutAction } from "@/app/actions";

export async function Header() {
  const configured = isSupabaseConfigured();
  const session = configured ? await getSession() : null;
  const profile = session ? await getCurrentProfile() : null;

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          🏘️ Directorio vecinal
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">
            Directorio
          </Link>
          <Link href="/eventos" className="hover:underline">
            Eventos
          </Link>
          {profile?.status === "approved" && (
            <Link
              href="/alta"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
            >
              + Recomendar
            </Link>
          )}
          {profile?.is_admin && (
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          )}

          {!session && configured && (
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Entrar
            </Link>
          )}
          {session && !profile && (
            <Link href="/registro" className="text-amber-600 hover:underline">
              Completa tu registro
            </Link>
          )}
          {profile?.status === "pending" && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Cuenta en revisión
            </span>
          )}
          {session && (
            <form action={signOutAction}>
              <button type="submit" className="text-zinc-500 hover:underline">
                Salir
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
