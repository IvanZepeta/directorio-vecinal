"use client";

import { useActionState, useEffect, useState } from "react";
import {
  deleteReviewAction,
  updateReviewAction,
  type ReviewFormState,
} from "@/app/proveedor/[id]/actions";
import { StarRating } from "./star-rating";
import { authorDisplay } from "@/lib/format";
import type { Review } from "@/lib/types";

export function ReviewItem({
  review,
  providerId,
  canEdit,
  canSeeAuthor,
}: {
  review: Review;
  providerId: string;
  canEdit: boolean;
  canSeeAuthor: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [state, submit, pending] = useActionState<ReviewFormState, FormData>(
    updateReviewAction,
    {},
  );

  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state.success]);

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">
          {authorDisplay(review.author_name, canSeeAuthor)}
        </span>
        {!editing && <StarRating value={review.rating} className="text-sm" />}
      </div>

      {!editing && (
        <>
          {review.comment && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {review.comment}
            </p>
          )}
          {review.service_date && (
            <p className="mt-1 text-xs text-zinc-400">
              Servicio: {review.service_date}
            </p>
          )}
          {canEdit && (
            <div className="mt-3 flex gap-3 text-sm">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-emerald-600 hover:underline"
              >
                Editar
              </button>
              <form
                action={deleteReviewAction}
                onSubmit={(e) => {
                  if (!confirm("¿Eliminar tu reseña? Esto no se puede deshacer.")) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="reviewId" value={review.id} />
                <input type="hidden" name="providerId" value={providerId} />
                <button type="submit" className="text-red-500 hover:underline">
                  Eliminar
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {editing && (
        <form action={submit} className="mt-2 space-y-3">
          <input type="hidden" name="reviewId" value={review.id} />
          <input type="hidden" name="providerId" value={providerId} />
          <input type="hidden" name="rating" value={rating} />

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

          <textarea
            name="comment"
            rows={3}
            maxLength={600}
            defaultValue={review.comment ?? ""}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />

          <input
            type="date"
            name="serviceDate"
            defaultValue={review.service_date ?? ""}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {pending ? "Guardando…" : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </article>
  );
}
