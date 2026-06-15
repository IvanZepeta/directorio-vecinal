export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-72 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-10 w-full max-w-sm animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
          >
            <div className="h-36 w-full animate-pulse bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-2 p-4">
              <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
