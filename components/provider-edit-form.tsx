"use client";

import { useActionState } from "react";
import {
  updateProviderAction,
  type ProviderEditState,
} from "@/app/proveedor/[id]/editar/actions";
import type { Category, Provider } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function ProviderEditForm({
  provider,
  categories,
}: {
  provider: Provider;
  categories: Category[];
}) {
  const [state, submit, pending] = useActionState<ProviderEditState, FormData>(
    updateProviderAction,
    {},
  );
  const selected = new Set(provider.categories.map((c) => c.id));

  return (
    <form action={submit} className="space-y-4">
      <input type="hidden" name="providerId" value={provider.id} />

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Nombre del proveedor *</span>
        <input
          name="name"
          required
          maxLength={80}
          defaultValue={provider.name}
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
          defaultValue={provider.whatsapp}
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
                defaultChecked={selected.has(category.id)}
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
          defaultValue={provider.description ?? ""}
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
          defaultValue={provider.areas ?? ""}
          className={inputClass}
        />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
