import { z, type ZodError } from "zod";
import { cleanPhone } from "./format";
import {
  isValidLink,
  LINK_KINDS,
  LINK_META,
  linkFieldName,
  normalizeLink,
  type LinkKind,
} from "./links";

// Convierte los issues de Zod en un mapa { campo: primer mensaje }
// para mostrar cada error junto a su campo.
export function fieldErrorsFrom(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}

// Limpia el número (quita espacios/guiones/lada) ANTES de validar que sean
// 10 dígitos. Así el vecino puede escribir "81 1234 5678" y se guarda limpio.
const phoneField = (label: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? cleanPhone(value) : value),
    z.string().regex(/^\d{10}$/, `${label} debe tener 10 dígitos`),
  );

export const profileSchema = z.object({
  name: z.string().trim().min(3, "Nombre muy corto").max(80),
  phone: phoneField("El teléfono"),
  street: z.string().trim().min(2, "Indica tu privada o calle").max(80),
  neighborhoodId: z.uuid("Elige tu fraccionamiento"),
});

// Vacío = sin link. Lleno = https y host del tipo correcto (espejo de la BD).
const linkField = (kind: LinkKind) =>
  z.preprocess(
    (value) => (typeof value === "string" ? normalizeLink(value) : ""),
    z
      .string()
      .refine(
        (url) => url === "" || isValidLink(kind, url),
        `No parece un link de ${LINK_META[kind].label}`,
      ),
  );

const linkFields = Object.fromEntries(
  LINK_KINDS.map((kind) => [linkFieldName(kind), linkField(kind)]),
) as Record<ReturnType<typeof linkFieldName>, ReturnType<typeof linkField>>;

// Junta los campos `link_*` ya validados en la lista que se guarda.
export function linksFrom(
  data: Partial<Record<ReturnType<typeof linkFieldName>, string>>,
): { kind: LinkKind; url: string }[] {
  return LINK_KINDS.flatMap((kind) => {
    const url = data[linkFieldName(kind)];
    return url ? [{ kind, url }] : [];
  });
}

// Lee los `link_*` del FormData para pasarlos a safeParse.
export function linkInputs(formData: FormData) {
  return Object.fromEntries(
    LINK_KINDS.map((kind) => [
      linkFieldName(kind),
      formData.get(linkFieldName(kind)),
    ]),
  );
}

export const providerSchema = z.object({
  name: z.string().trim().min(3, "Nombre muy corto").max(80),
  whatsapp: phoneField("El WhatsApp"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  areas: z.string().trim().max(200).optional().or(z.literal("")),
  categories: z.array(z.uuid()).min(1, "Elige al menos una categoría"),
  ...linkFields,
});

export const reviewSchema = z.object({
  providerId: z.uuid(),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Califica con al menos 1 estrella")
    .max(5),
  comment: z.string().trim().max(600).optional().or(z.literal("")),
  serviceDate: z.string().optional().or(z.literal("")),
});

export const reviewUpdateSchema = reviewSchema
  .omit({ providerId: true })
  .extend({ reviewId: z.uuid() });

export const providerUpdateSchema = providerSchema.extend({
  providerId: z.uuid(),
});
