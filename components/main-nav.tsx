"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/app/actions";

interface NavProps {
  configured: boolean;
  hasSession: boolean;
  hasProfile: boolean;
  isApproved: boolean;
  isPending: boolean;
  isAdmin: boolean;
}

export function MainNav(props: NavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function linkClass(href: string) {
    const active =
      href === "/" ? pathname === "/" : pathname.startsWith(href);
    return active
      ? "font-medium text-emerald-600 dark:text-emerald-400"
      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";
  }

  const close = () => setOpen(false);

  const renderItems = (stacked: boolean) => {
    const base = stacked ? "block py-1.5" : "";
    return (
      <>
        <Link href="/" onClick={close} className={`${base} ${linkClass("/")}`}>
          Directorio
        </Link>
        <Link
          href="/eventos"
          onClick={close}
          className={`${base} ${linkClass("/eventos")}`}
        >
          Eventos
        </Link>
        {props.isApproved && (
          <Link
            href="/alta"
            onClick={close}
            className={
              stacked
                ? "block py-1.5 font-medium text-emerald-600 dark:text-emerald-400"
                : "rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
            }
          >
            + Recomendar
          </Link>
        )}
        {props.isAdmin && (
          <Link
            href="/admin"
            onClick={close}
            className={`${base} ${linkClass("/admin")}`}
          >
            Admin
          </Link>
        )}
        {!props.hasSession && props.configured && (
          <Link
            href="/login"
            onClick={close}
            className={
              stacked
                ? "block py-1.5 font-medium text-zinc-900 dark:text-zinc-100"
                : "rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            }
          >
            Entrar
          </Link>
        )}
        {props.hasSession && !props.hasProfile && (
          <Link
            href="/registro"
            onClick={close}
            className={`${base} text-amber-600 hover:underline`}
          >
            Completa tu registro
          </Link>
        )}
        {props.isPending && (
          <span
            className={
              stacked
                ? "block py-1.5 text-xs text-amber-700 dark:text-amber-300"
                : "rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200"
            }
          >
            Cuenta en revisión
          </span>
        )}
        {props.hasSession && (
          <form action={signOutAction} className={stacked ? "pt-1" : ""}>
            <button
              type="submit"
              className="text-zinc-500 hover:underline"
            >
              Salir
            </button>
          </form>
        )}
      </>
    );
  };

  return (
    <>
      <nav className="hidden items-center gap-4 text-sm sm:flex">
        {renderItems(false)}
      </nav>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:hidden"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-zinc-200 bg-white px-4 py-3 text-sm shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:hidden">
          {renderItems(true)}
        </div>
      )}
    </>
  );
}
