"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registroSchema, type RegistroFormValues } from "@/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

const opcionesRol = [
  { value: "voluntario", label: "Voluntario/a" },
  { value: "donante", label: "Quiero donar" },
  { value: "anfitriion", label: "Ofrezco alojamiento" },
  { value: "responsable_centro", label: "Responsable de centro" },
  { value: "administrador", label: "Administrador" },
];

async function asegurarPerfil(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  nombre: string,
  rol: string,
  ciudad?: string,
  telefono?: string
) {
  const { data: perfilExistente } = await supabase
    .from("perfiles")
    .select("id")
    .eq("usuario_id", userId)
    .maybeSingle();

  if (!perfilExistente) {
    await supabase.from("perfiles").insert({
      usuario_id: userId,
      nombre_completo: nombre,
      rol: rol,
      ciudad: ciudad || null,
      telefono: telefono || null,
    });
  } else if (ciudad || telefono) {
    await supabase
      .from("perfiles")
      .update({
        ciudad: ciudad || null,
        telefono: telefono || null,
      })
      .eq("usuario_id", userId);
  }
}

export default function RegistroPage() {
  const router = useRouter();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [registrado, setRegistrado] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: { rol: "voluntario" },
  });

  async function onSubmit(values: RegistroFormValues) {
    setErrorServidor(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          nombre_completo: values.nombre_completo,
          rol: values.rol,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      const msg = error.message ?? "";
      if (
        msg.toLowerCase().includes("already registered") ||
        msg.toLowerCase().includes("already been registered")
      ) {
        setErrorServidor("Este email ya esta registrado. Inicia sesion.");
      } else if (msg.toLowerCase().includes("password")) {
        setErrorServidor("La contrasena no cumple los requisitos minimos.");
      } else if (msg === "" || msg === "{}") {
        setErrorServidor(
          "Hubo un error interno. Por favor intenta de nuevo en unos segundos."
        );
      } else {
        setErrorServidor("Error al crear la cuenta: " + msg);
      }
      return;
    }

    if (data.user) {
      await asegurarPerfil(
        supabase,
        data.user.id,
        values.nombre_completo,
        values.rol,
        values.ciudad,
        values.telefono
      );
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setRegistrado(true);
  }

  if (registrado) {
    return (
      <Card>
        <div className="text-center py-4">
          <div className="text-5xl mb-4">&#x2705;</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cuenta creada
          </h2>
          <p className="text-gray-500 mb-2">
            Revisa tu email para confirmar tu cuenta.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Si no ves el email, revisa la carpeta de spam.
          </p>
          <Link href="/login">
            <Button fullWidth>Ir al inicio de sesion</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Crear cuenta
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre completo"
          type="text"
          placeholder="Juan Perez"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.nombre_completo?.message}
          required
          {...register("nombre_completo")}
        />

        <Select
          label="Soy..."
          options={opcionesRol}
          error={errors.rol?.message}
          required
          {...register("rol")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          required
          {...register("email")}
        />

        <Input
          label="Ciudad"
          type="text"
          placeholder="Caracas"
          leftIcon={<MapPin className="h-4 w-4" />}
          error={errors.ciudad?.message}
          {...register("ciudad")}
        />

        <Input
          label="Telefono"
          type="tel"
          placeholder="+58 412 0000000"
          leftIcon={<Phone className="h-4 w-4" />}
          error={errors.telefono?.message}
          {...register("telefono")}
        />

        <Input
          label="Contrasena"
          type="password"
          placeholder="Minimo 8 caracteres"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          required
          {...register("password")}
        />

        <Input
          label="Confirmar contrasena"
          type="password"
          placeholder="Repeti tu contrasena"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmar_password?.message}
          required
          {...register("confirmar_password")}
        />

        {errorServidor && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{errorServidor}</p>
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
        >
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Ya tenes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Iniciar sesion
        </Link>
      </p>
    </Card>
  );
}
