import { isSupabaseConfigured } from "@/lib/config";
import { getUpcomingEvents } from "@/lib/data/events";
import { SetupNotice } from "@/components/setup-notice";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const events = await getUpcomingEvents();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Eventos del parque</h1>

      {events.length === 0 && (
        <p className="py-12 text-center text-zinc-500">
          No hay eventos próximos. ¡Pronto habrá novedades!
        </p>
      )}

      <div className="space-y-4">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-emerald-600">
              {new Date(event.starts_at).toLocaleDateString("es-MX", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <h2 className="text-lg font-medium">{event.title}</h2>
            {event.location && (
              <p className="text-sm text-zinc-500">📍 {event.location}</p>
            )}
            {event.description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {event.description}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
