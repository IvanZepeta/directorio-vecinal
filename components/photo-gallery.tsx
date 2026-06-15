"use client";

import { useCallback, useEffect, useState } from "react";
import { deletePhotoAction } from "@/app/proveedor/[id]/actions";
import { authorDisplay } from "@/lib/format";
import type { ProviderPhoto } from "@/lib/types";

export function PhotoGallery({
  photos,
  providerId,
  providerName,
  viewerId,
  isAdmin,
  canSeeAuthor,
}: {
  photos: ProviderPhoto[];
  providerId: string;
  providerName: string;
  viewerId: string | null;
  isAdmin: boolean;
  canSeeAuthor: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const goPrevious = useCallback(() => {
    setOpenIndex((i) =>
      i === null ? null : (i - 1 + photos.length) % photos.length,
    );
  }, [photos.length]);

  const goNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (openIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowLeft") goPrevious();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, goPrevious, goNext]);

  const current = openIndex === null ? null : photos[openIndex];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, index) => {
          const canDelete =
            viewerId !== null &&
            (photo.uploaded_by === viewerId || isAdmin);

          return (
            <div key={photo.id} className="relative">
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="block w-full cursor-zoom-in"
                aria-label="Ver foto en grande"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Trabajo de ${providerName}`}
                  className="h-32 w-full rounded-lg object-cover"
                />
              </button>
              {canSeeAuthor && photo.author_name && (
                <p className="mt-1 text-xs text-zinc-400">
                  📷 {authorDisplay(photo.author_name, true)}
                </p>
              )}
              {canDelete && (
                <form
                  action={deletePhotoAction}
                  onSubmit={(e) => {
                    if (!confirm("¿Eliminar esta foto?")) e.preventDefault();
                  }}
                  className="absolute right-1.5 top-1.5"
                >
                  <input type="hidden" name="photoId" value={photo.id} />
                  <input type="hidden" name="providerId" value={providerId} />
                  <button
                    type="submit"
                    aria-label="Eliminar foto"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm text-white hover:bg-red-600"
                  >
                    ✕
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {current && (
        <div
          role="dialog"
          aria-label={`Fotos de ${providerName}`}
          onClick={() => setOpenIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={`Trabajo de ${providerName}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />

          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrevious();
                }}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/30"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Foto siguiente"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/30"
              >
                ›
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-white/80">
            {photos.length > 1 && (
              <span>
                {openIndex! + 1} / {photos.length}
              </span>
            )}
            {canSeeAuthor && current.author_name && (
              <span className="ml-2">
                · 📷 {authorDisplay(current.author_name, true)}
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg text-white hover:bg-white/30"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
