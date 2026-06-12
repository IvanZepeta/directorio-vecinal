export function SetupNotice() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-700 dark:bg-amber-950">
      <h2 className="mb-3 text-lg font-medium text-amber-900 dark:text-amber-100">
        Falta conectar Supabase
      </h2>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-amber-800 dark:text-amber-200">
        <li>
          Crea un proyecto gratis en{" "}
          <a href="https://supabase.com" className="underline">
            supabase.com
          </a>
        </li>
        <li>
          En el SQL Editor, ejecuta{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
            supabase/migrations/0001_initial.sql
          </code>
        </li>
        <li>
          Copia la URL y la anon key (Settings → API) a{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">
            .env.local
          </code>
        </li>
        <li>Reinicia el servidor de desarrollo</li>
      </ol>
      <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
        Los pasos completos están en el README del proyecto.
      </p>
    </div>
  );
}
