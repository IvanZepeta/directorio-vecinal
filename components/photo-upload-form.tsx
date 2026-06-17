"use client";

import { startTransition, useActionState, useState } from "react";
import {
  addPhotosAction,
  type PhotoUploadState,
} from "@/app/proveedor/[id]/actions";
import { compressImage } from "@/lib/compress-image";

export function PhotoUploadForm({ providerId }: { providerId: string }) {
  const [state, formAction, pending] = useActionState<
    PhotoUploadState,
    FormData
  >(addPhotosAction, {});
  const [files, setFiles] = useState<File[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);
    setCompressing(true);
    const data = new FormData();
    data.set("providerId", providerId);
    try {
      for (const file of files) {
        const compressed = await compressImage(file);
        data.append("photos", compressed, compressed.name);
      }
    } catch (err) {
      setCompressing(false);
      setLocalError(
        err instanceof Error ? err.message : "No se pudo procesar la foto.",
      );
      return;
    }
    setCompressing(false);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-sm text-zinc-500">
        ¿Te hizo un trabajo? Comparte fotos (máx. 4)
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
          📷 Elegir fotos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) =>
              setFiles(Array.from(e.target.files ?? []).slice(0, 4))
            }
          />
        </label>
        <span className="text-sm text-zinc-500">
          {files.length === 0
            ? "Ninguna foto seleccionada"
            : `${files.length} foto${files.length > 1 ? "s" : ""} seleccionada${files.length > 1 ? "s" : ""}`}
        </span>
      </div>

      {(localError || state.error) && (
        <p className="text-sm text-red-600">{localError ?? state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-600">¡Fotos publicadas!</p>
      )}

      <button
        type="submit"
        disabled={compressing || pending || files.length === 0}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {compressing ? "Optimizando…" : pending ? "Subiendo…" : "Subir fotos"}
      </button>
    </form>
  );
}
