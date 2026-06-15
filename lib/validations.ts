import { z, type ZodError } from "zod";
import { cleanPhone } from "./format";

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

export const providerSchema = z.object({
  name: z.string().trim().min(3, "Nombre muy corto").max(80),
  whatsapp: phoneField("El WhatsApp"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  areas: z.string().trim().max(200).optional().or(z.literal("")),
  categories: z.array(z.uuid()).min(1, "Elige al menos una categoría"),
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
