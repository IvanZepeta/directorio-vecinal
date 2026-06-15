"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions";

export function MainNav({
  configured,
  hasSession,
  hasProfile,
  isApproved,
  isPending,
  isAdmin,
}: {
  configured: boolean;
  hasSession: boolean;
  hasProfile: boolean;
  isApproved: boolean;
  isPending: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  function linkClass(href: string) {
    const active =
      href === "/" ? pathname === "/" : pathname.startsWith(href);
    return active
      ? "font-medium text-emerald-600 dark:text-emerald-400"
      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";
  }

  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link href="/" className={linkClass("/")}>
        Directorio
      </Link>
      <Link href="/eventos" className={linkClass("/eventos")}>
        Eventos
      </Link>
      {isApproved && (
        <Link
          href="/alta"
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
        >
          + Recomendar
        </Link>
      )}
      {isAdmin && (
        <Link href="/admin" className={linkClass("/admin")}>
          Admin
        </Link>
      )}

      {!hasSession && configured && (
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Entrar
        </Link>
      )}
      {hasSession && !hasProfile && (
        <Link href="/registro" className="text-amber-600 hover:underline">
          Completa tu registro
        </Link>
      )}
      {isPending && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Cuenta en revisión
        </span>
      )}
      {hasSession && (
        <form action={signOutAction}>
          <button type="submit" className="text-zinc-500 hover:underline">
            Salir
          </button>
        </form>
      )}
    </nav>
  );
}
