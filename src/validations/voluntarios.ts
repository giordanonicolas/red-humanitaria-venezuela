import { z } from "zod";

export const voluntarioSchema = z.object({
  disponibilidad: z.enum(["inmediata", "fines_semana", "entre_semana", "flexible"]).default("flexible"),
  tiene_vehiculo: z.boolean().default(false),
  tipo_vehiculo: z.string().optional(),
  puede_transportar: z.boolean().default(false),
  puede_ayudar_centro: z.boolean().default(true),
  puede_cocinar: z.boolean().default(false),
  puede_asistir_medicamente: z.boolean().default(false),
  observaciones: z.string().optional(),
});

export type VoluntarioFormValues = z.infer<typeof voluntarioSchema>;
