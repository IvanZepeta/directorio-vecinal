import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/config";
import { getCategories } from "@/lib/data/categories";
import { getProviders } from "@/lib/data/providers";
import { ProviderCard } from "@/components/provider-card";
import { SetupNotice } from "@/components/setup-notice";

export const dynamic = "force-dynamic";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const { categoria, q } = await searchParams;
  const [categories, providers] = await Promise.all([
    getCategories(),
    getProviders({ categoryId: categoria, search: q }),
  ]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">
          Recomendados por tus vecinos
        </h1>
        <form className="flex gap-2" action="/">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre…"
            className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Buscar
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-full px-3 py-1 text-sm ${
              !categoria
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            Todas
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/?categoria=${category.id}`}
              className={`rounded-full px-3 py-1 text-sm ${
                categoria === category.id
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {providers.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">
          Aún no hay proveedores aquí. ¡Sé quien recomiende al primero!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
