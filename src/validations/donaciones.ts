import { z } from "zod";

export const donacionSchema = z.object({
  nombre_donante: z.string().min(2, "El nombre es requerido"),
  categoria: z.enum([
    "agua", "alimentos", "medicamentos", "insumos_medicos", "ropa", "calzado",
    "higiene", "panales", "colchones", "frazadas", "carpas", "linternas",
    "baterias", "gas", "combustible", "herramientas", "otros",
  ]),
  descripcion: z.string().min(5, "La descripción es requerida"),
  cantidad: z
    .number({ invalid_type_error: "Ingresá un número válido" })
    .min(0.01, "La cantidad debe ser mayor a 0"),
  unidad: z.string().min(1, "La unidad es requerida"),
  centro_destino_id: z.string().uuid().optional().nullable(),
  estado: z.enum(["pendiente", "en_camino", "entregado", "recibido"]).default("pendiente"),
  observaciones: z.string().optional(),
  latitud: z.number().optional().nullable(),
  longitud: z.number().optional().nullable(),
  ubicacion_url: z.string().optional().nullable(),
});

export type DonacionFormValues = z.infer<typeof donacionSchema>;
