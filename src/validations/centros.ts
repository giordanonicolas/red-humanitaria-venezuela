import { z } from "zod";

export const centroSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  direccion: z.string().min(5, "La dirección es requerida"),
  ciudad: z.string().min(2, "La ciudad es requerida"),
  estado_region: z.string().min(2, "El estado/región es requerido"),
  contacto_nombre: z.string().min(2, "El nombre de contacto es requerido"),
  contacto_telefono: z.string().min(7, "El teléfono de contacto es requerido"),
  capacidad_maxima: z
    .number({ invalid_type_error: "Ingresá un número válido" })
    .int()
    .min(0, "Debe ser mayor o igual a 0"),
  personas_atendidas: z
    .number({ invalid_type_error: "Ingresá un número válido" })
    .int()
    .min(0)
    .default(0),
  estado: z.enum(["activo", "saturado", "necesita_apoyo", "cerrado_temporalmente"]).default("activo"),
  observaciones: z.string().optional(),
  latitud: z.number().optional().nullable(),
  longitud: z.number().optional().nullable(),
  ubicacion_url: z.string().optional().nullable(),
});

export type CentroFormValues = z.infer<typeof centroSchema>;
