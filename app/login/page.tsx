"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setSending(false);
    if (error) {
      setError(
        error.message.toLowerCase().includes("rate limit")
          ? "Se alcanzó el límite de correos por hora. Espera un rato e intenta de nuevo."
          : `No se pudo enviar el enlace: ${error.message}`,
      );
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <h1 className="mb-2 text-xl font-semibold">Revisa tu correo 📬</h1>
        <p className="text-sm text-zinc-500">
          Te enviamos un enlace a <strong>{email}</strong>. Ábrelo desde este
          dispositivo para entrar.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4 py-8">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <p className="text-sm text-zinc-500">
        Sin contraseñas: te mandamos un enlace mágico a tu correo.
      </p>
      <form onSubmit={sendMagicLink} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {sending ? "Enviando…" : "Enviarme el enlace"}
        </button>
      </form>
    </div>
  );
}
