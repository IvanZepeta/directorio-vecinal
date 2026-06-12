import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(3, "Nombre muy corto").max(80),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Teléfono a 10 dígitos, sin espacios"),
  street: z.string().trim().min(2, "Indica tu privada o calle").max(80),
  neighborhoodId: z.uuid("Elige tu fraccionamiento"),
});

export const providerSchema = z.object({
  name: z.string().trim().min(3, "Nombre muy corto").max(80),
  whatsapp: z
    .string()
    .regex(/^\d{10}$/, "WhatsApp a 10 dígitos, sin espacios"),
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
