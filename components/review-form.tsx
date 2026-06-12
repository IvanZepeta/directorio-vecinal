"use client";

import { useActionState, useState } from "react";
import {
  createReviewAction,
  type ReviewFormState,
} from "@/app/proveedor/[id]/actions";

export function ReviewForm({ providerId }: { providerId: string }) {
  const [state, submit, pending] = useActionState<ReviewFormState, FormData>(
    createReviewAction,
    {},
  );
  const [rating, setRating] = useState(0);

  if (state.success) {
    return (
      <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        ¡Gracias por tu reseña! Ya está publicada.
      </p>
    );
  }

  return (
    <form action={submit} className="space-y-3">
      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <span className="mb-1 block text-sm font-medium">
          ¿Cómo fue el trabajo?
        </span>
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} estrellas`}
              className={
                n <= rating
                  ? "text-amber-500"
                  : "text-zinc-300 hover:text-amber-300 dark:text-zinc-600"
              }
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <textarea
        name="comment"
        rows={3}
        maxLength={600}
        placeholder="Cuéntale a tus vecinos cómo te fue (opcional)"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />

      <label className="block text-sm">
        <span className="mb-1 block text-zinc-500">
          ¿Cuándo fue el servicio? (opcional)
        </span>
        <input
          type="date"
          name="serviceDate"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Publicando…" : "Publicar reseña"}
      </button>
    </form>
  );
}
