"use client";

import { useActionState, useRef, useState } from "react";
import {
  addPhotosAction,
  type PhotoUploadState,
} from "@/app/proveedor/[id]/actions";

export function PhotoUploadForm({ providerId }: { providerId: string }) {
  const [state, submit, pending] = useActionState<PhotoUploadState, FormData>(
    addPhotosAction,
    {},
  );
  const [count, setCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form action={submit} className="space-y-2">
      <input type="hidden" name="providerId" value={providerId} />
      <p className="text-sm text-zinc-500">
        ¿Te hizo un trabajo? Comparte fotos (máx. 5)
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
          📷 Elegir fotos
          <input
            ref={inputRef}
            type="file"
            name="photos"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => setCount(e.target.files?.length ?? 0)}
          />
        </label>
        <span className="text-sm text-zinc-500">
          {count === 0
            ? "Ninguna foto seleccionada"
            : `${count} foto${count > 1 ? "s" : ""} seleccionada${count > 1 ? "s" : ""}`}
        </span>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-600">¡Fotos publicadas!</p>
      )}

      <button
        type="submit"
        disabled={pending || count === 0}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Subiendo…" : "Subir fotos"}
      </button>
    </form>
  );
}
