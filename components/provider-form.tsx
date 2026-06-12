"use client";

import { useActionState, useState } from "react";
import {
  createProviderAction,
  type ProviderFormState,
} from "@/app/alta/actions";
import type { Category } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function ProviderForm({ categories }: { categories: Category[] }) {
  const [state, submit, pending] = useActionState<ProviderFormState, FormData>(
    createProviderAction,
    {},
  );
  const [photoCount, setPhotoCount] = useState(0);

  return (
    <form action={submit} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Nombre del proveedor *</span>
        <input
          name="name"
          required
          maxLength={80}
          placeholder="Ej. Don José — plomero"
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">WhatsApp (10 dígitos) *</span>
        <input
          name="whatsapp"
          required
          inputMode="numeric"
          pattern="\d{10}"
          placeholder="8112345678"
          className={inputClass}
        />
      </label>

      <fieldset className="text-sm">
        <legend className="mb-1 font-medium">
          ¿Qué servicios ofrece? * (puedes marcar varios)
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700"
            >
              <input
                type="checkbox"
                name="categories"
                value={category.id}
              />
              {category.name}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Descripción (opcional)</span>
        <textarea
          name="description"
          rows={3}
          maxLength={500}
          placeholder="¿Qué hace bien? ¿Cómo cobra? ¿Algo que el vecino deba saber?"
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">
          Zonas donde trabaja (opcional)
        </span>
        <input
          name="areas"
          maxLength={200}
          placeholder="Ej. todo el fraccionamiento y alrededores"
          className={inputClass}
        />
      </label>

      <div className="text-sm">
        <span className="mb-1 block font-medium">
          Fotos de sus trabajos (opcional, máx. 5)
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
            📷 Elegir fotos
            <input
              type="file"
              name="photos"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setPhotoCount(e.target.files?.length ?? 0)}
            />
          </label>
          <span className="text-zinc-500">
            {photoCount === 0
              ? "Ninguna foto seleccionada"
              : `${photoCount} foto${photoCount > 1 ? "s" : ""} seleccionada${photoCount > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Recomendar proveedor"}
      </button>
    </form>
  );
}
