// La descripción es texto libre (viene de WhatsApp, de su anuncio…). Se respetan
// los saltos de línea y las líneas que empiezan con guion se vuelven lista.
// Se arma con elementos de React a propósito: nada de HTML ni markdown crudo,
// el texto lo escribe cualquier vecino aprobado.

type Block = { type: "text"; lines: string[] } | { type: "list"; items: string[] };

// "- Alberca", "-Alberca", "– Alberca", "• Alberca"
const BULLET = /^\s*[-–•]\s*(\S.*)$/;

function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | null = null;

  for (const line of text.split(/\r?\n/)) {
    const bullet = line.match(BULLET);
    if (bullet) {
      if (current?.type !== "list") {
        current = { type: "list", items: [] };
        blocks.push(current);
      }
      current.items.push(bullet[1]);
    } else if (line.trim() === "") {
      // Línea en blanco = cambio de párrafo
      current = null;
    } else {
      if (current?.type !== "text") {
        current = { type: "text", lines: [] };
        blocks.push(current);
      }
      current.lines.push(line.trim());
    }
  }
  return blocks;
}

export function ProviderDescription({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
      {toBlocks(text).map((block, i) =>
        block.type === "list" ? (
          <ul key={i} className="list-disc space-y-0.5 pl-5">
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-line">
            {block.lines.join("\n")}
          </p>
        ),
      )}
    </div>
  );
}
