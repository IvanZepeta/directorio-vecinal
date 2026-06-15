"use client";

import { useActionState, useState } from "react";
import {
  createProfileAction,
  type SignupFormState,
} from "@/app/registro/actions";
import { FieldError } from "@/components/field-error";
import { cleanPhone } from "@/lib/format";
import type { Neighborhood } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function SignupForm({
  neighborhoods,
}: {
  neighborhoods: Neighborhood[];
}) {
  const [state, submit, pending] = useActionState<SignupFormState, FormData>(
    createProfileAction,
    {},
  );
  const [phoneError, setPhoneError] = useState<string | null>(null);

  function validatePhone(value: string) {
    if (!value.trim()) return setPhoneError(null);
    setPhoneError(
      cleanPhone(value).length === 10 ? null : "El teléfono debe tener 10 dígitos",
    );
  }

  return (
    <form action={submit} className="space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Tu nombre *</span>
        <input name="name" required maxLength={80} className={inputClass} />
        <FieldError message={state.fieldErrors?.name} />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Fraccionamiento *</span>
        <select
          name="neighborhoodId"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Elige tu fraccionamiento…
          </option>
          {neighborhoods.map((neighborhood) => (
            <option key={neighborhood.id} value={neighborhood.id}>
              {neighborhood.name}
            </option>
          ))}
        </select>
        <FieldError message={state.fieldErrors?.neighborhoodId} />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">
          Teléfono (10 dígitos) *
        </span>
        <input
          name="phone"
          required
          inputMode="tel"
          placeholder="81 1234 5678"
          onBlur={(e) => validatePhone(e.target.value)}
          className={inputClass}
        />
        <FieldError message={phoneError ?? state.fieldErrors?.phone} />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Privada o calle *</span>
        <input
          name="street"
          required
          maxLength={80}
          placeholder="Ej. Privada Encinos 12"
          className={inputClass}
        />
        <FieldError message={state.fieldErrors?.street} />
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Enviar registro"}
      </button>

      <p className="text-xs text-zinc-400">
        Un administrador validará que vives en el fraccionamiento antes de
        activar tu cuenta.
      </p>
    </form>
  );
}
