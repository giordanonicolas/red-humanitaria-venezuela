import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresá un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registroSchema = z
  .object({
    nombre_completo: z
      .string()
      .min(2, "Ingresá tu nombre completo")
      .max(100, "El nombre es demasiado largo"),
    email: z
      .string()
      .min(1, "El email es requerido")
      .email("Ingresá un email válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmar_password: z.string(),
    rol: z.enum(
      ["administrador", "responsable_centro", "voluntario", "donante", "anfitriion"],
      { required_error: "Seleccioná un rol" }
    ),
    ciudad: z.string().optional(),
    telefono: z.string().optional(),
    alias: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmar_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_password"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegistroFormValues = z.infer<typeof registroSchema>;
