import { avatarBg, avatarInitial } from "@/lib/avatar";

export function Avatar({
  name,
  className = "h-12 w-12 text-base",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex aspect-square shrink-0 select-none items-center justify-center rounded-full font-medium uppercase leading-none text-white ${avatarBg(name)} ${className}`}
    >
      {avatarInitial(name)}
    </span>
  );
}
