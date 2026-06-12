import { notFound } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { getCurrentProfile, getPendingProfiles } from "@/lib/data/profiles";
import { SetupNotice } from "@/components/setup-notice";
import { approveProfileAction, blockProfileAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const profile = await getCurrentProfile();
  if (!profile?.is_admin) notFound();

  const pending = await getPendingProfiles();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Administración</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">
          Vecinos pendientes de aprobación ({pending.length})
        </h2>

        {pending.length === 0 && (
          <p className="text-sm text-zinc-500">No hay solicitudes nuevas.</p>
        )}

        {pending.map((neighbor) => (
          <div
            key={neighbor.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div>
              <p className="font-medium">{neighbor.name}</p>
              <p className="text-sm text-zinc-500">
                {neighbor.street} · {neighbor.phone}
              </p>
            </div>
            <div className="flex gap-2">
              <form action={approveProfileAction}>
                <input type="hidden" name="profileId" value={neighbor.id} />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
                >
                  Aprobar
                </button>
              </form>
              <form action={blockProfileAction}>
                <input type="hidden" name="profileId" value={neighbor.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Rechazar
                </button>
              </form>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
