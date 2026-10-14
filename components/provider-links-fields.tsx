import { FieldError } from "@/components/field-error";
import {
  LINK_META,
  linkFieldName,
  type LinkKind,
} from "@/lib/links";
import type { ProviderLink } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

// Facebook e Instagram cubren a casi todos; el resto se pliega para no
// alargar el formulario.
const MAIN: LinkKind[] = ["facebook", "instagram"];
const MORE: LinkKind[] = ["tiktok", "canva", "maps", "website"];

function LinkInput({
  kind,
  defaultValue,
  error,
}: {
  kind: LinkKind;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-zinc-600 dark:text-zinc-400">
        {LINK_META[kind].label}
      </span>
      {/* type="text" y no "url": el navegador rechazaría "facebook.com/x"
          sin https, que normalizeLink completa en el servidor. */}
      <input
        name={linkFieldName(kind)}
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={500}
        defaultValue={defaultValue}
        placeholder={LINK_META[kind].placeholder}
        className={inputClass}
      />
      <FieldError message={error} />
    </label>
  );
}

export function ProviderLinksFields({
  links = [],
  fieldErrors,
}: {
  links?: ProviderLink[];
  fieldErrors?: Record<string, string>;
}) {
  const current = (kind: LinkKind) =>
    links.find((l) => l.kind === kind)?.url;
  // Si ya hay algo capturado (o con error) en los plegados, se abren.
  const moreOpen = MORE.some(
    (kind) => current(kind) || fieldErrors?.[linkFieldName(kind)],
  );

  return (
    <fieldset className="space-y-3 text-sm">
      <legend className="mb-1 font-medium">Redes y links (opcional)</legend>
      <p className="-mt-1 text-zinc-500">
        Para que los vecinos vean fotos y más de su trabajo. Pega el link de
        su página.
      </p>
      {MAIN.map((kind) => (
        <LinkInput
          key={kind}
          kind={kind}
          defaultValue={current(kind)}
          error={fieldErrors?.[linkFieldName(kind)]}
        />
      ))}
      <details open={moreOpen} className="group">
        <summary className="cursor-pointer text-emerald-600 hover:underline">
          Más links (TikTok, Canva, Maps, sitio web)
        </summary>
        <div className="mt-3 space-y-3">
          {MORE.map((kind) => (
            <LinkInput
              key={kind}
              kind={kind}
              defaultValue={current(kind)}
              error={fieldErrors?.[linkFieldName(kind)]}
            />
          ))}
        </div>
      </details>
    </fieldset>
  );
}
