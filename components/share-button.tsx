"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_NAME } from "@/lib/share";

// Solo recibe id y nombre, nunca el objeto del proveedor: lo que entra a un
// componente cliente viaja en el payload RSC (ver la sanitización en la ficha).
// Lo que se comparte es la URL de la ficha y el nombre. A propósito NO el
// teléfono: el contacto tiene que pasar por /ir/:id para contarse.
export function ShareButton({ id, name }: { id: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleShare() {
    // origin y no location.href: así no se cuelan ?query ni #hash. Sin
    // SITE_URL a propósito (el layout no tiene metadataBase): sale bien en
    // producción y en los previews de Vercel.
    const url = `${window.location.origin}/proveedor/${id}`;

    // Detección dentro del click y no al renderizar: si dependiera de
    // navigator en el render, el HTML del servidor no coincidiría.
    // navigator.share va primero y sin await previo: el navegador exige que
    // se llame dentro del gesto del usuario. Solo en pantallas táctiles:
    // Chrome/Edge en Windows también lo exponen y abren la hoja de Windows,
    // cuando en escritorio lo útil es copiar y pegar en WhatsApp Web.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `${name} · ${SITE_NAME}`, url });
        return;
      } catch (err) {
        // Cerró la hoja de compartir: no es un error ni toca copiar.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2500);
      return;
    } catch {
      // Sin clipboard (contexto no seguro, permiso negado): último recurso.
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:border-emerald-600 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
    >
      <span aria-live="polite">
        {copied ? "✅ ¡Link copiado!" : "🔗 Compartir"}
      </span>
    </button>
  );
}
