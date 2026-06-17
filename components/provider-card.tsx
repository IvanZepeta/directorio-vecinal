import Link from "next/link";
import type { Provider } from "@/lib/types";
import { StarRating } from "./star-rating";
import { Avatar } from "./avatar";

export function ProviderCard({ provider }: { provider: Provider }) {
  const photo = provider.photos[0];

  return (
    <Link
      href={`/proveedor/${provider.id}`}
      className="block overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt={`Trabajo de ${provider.name}`}
          loading="lazy"
          className="h-36 w-full object-cover"
        />
      )}
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-3">
          {!photo && (
            <Avatar name={provider.name} className="h-10 w-10 text-sm" />
          )}
          <h3 className="font-medium">{provider.name}</h3>
        </div>
        <div className="flex flex-wrap gap-1">
          {provider.categories.map((category) => (
            <span
              key={category.id}
              className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {category.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <StarRating value={provider.average_rating} className="text-sm" />
          {provider.review_count > 0 && (
            <span className="text-zinc-500">({provider.review_count})</span>
          )}
        </div>
        {provider.areas && (
          <p className="flex items-center gap-1 text-xs text-zinc-500">
            <span aria-hidden="true">📍</span>
            <span className="truncate">{provider.areas}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
