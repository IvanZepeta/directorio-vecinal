export function StarRating({
  value,
  className = "text-base",
}: {
  value: number | null;
  className?: string;
}) {
  if (value === null) {
    return <span className="text-sm text-zinc-400">Sin reseñas aún</span>;
  }
  const filled = Math.round(value);
  return (
    <span
      className={`${className} leading-none`}
      aria-label={`${value.toFixed(1)} de 5 estrellas`}
    >
      <span className="text-amber-500">{"★".repeat(filled)}</span>
      <span className="text-zinc-300 dark:text-zinc-600">
        {"★".repeat(5 - filled)}
      </span>
    </span>
  );
}
