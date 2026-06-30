"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { centroSchema, type CentroFormValues } from "@/validations/centros";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { SelectorUbicacion } from "@/components/ui/SelectorUbicacion";
import type { Centro } from "@/types";

const opcionesEstado = [
  { value: "activo", label: "Activo" },
  { value: "saturado", label: "Saturado" },
  { value: "necesita_apoyo", label: "Necesita apoyo" },
  { value: "cerrado_temporalmente", label: "Cerrado temporalmente" },
];

interface FormCentroProps {
  centroExistente?: Centro;
  onSubmit: (valores: CentroFormValues) => Promise<void>;
  onCancel: () => void;
}

export function FormCentro({ centroExistente, onSubmit, onCancel }: FormCentroProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CentroFormValues>({
    resolver: zodResolver(centroSchema),
    defaultValues: centroExistente
      ? {
          nombre: centroExistente.nombre,
          direccion: centroExistente.direccion,
          ciudad: centroExistente.ciudad,
          estado_region: centroExistente.estado_region,
          contacto_nombre: centroExistente.contacto_nombre,
          contacto_telefono: centroExistente.contacto_telefono,
          capacidad_maxima: centroExistente.capacidad_maxima,
          personas_atendidas: centroExistente.personas_atendidas,
          estado: centroExistente.estado,
          observaciones: centroExistente.observaciones || "",
          latitud: centroExistente.latitud,
          longitud: centroExistente.longitud,
          ubicacion_url: centroExistente.ubicacion_url,
        }
      : {
          estado: "activo",
          personas_atendidas: 0,
          capacidad_maxima: 0,
          latitud: null,
          longitud: null,
          ubicacion_url: null,
        },
  });

  const latActual = watch("latitud");
  const lngActual = watch("longitud");
  const urlActual = watch("ubicacion_url");

  const ubicacionActual =
    latActual != null && lngActual != null && urlActual
      ? { latitud: latActual, longitud: lngActual, ubicacion_url: urlActual }
      : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre del centro"
        placeholder="Centro Comunitario San José"
        error={errors.nombre?.message}
        required
        {...register("nombre")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Ciudad"
          placeholder="Caracas"
          error={errors.ciudad?.message}
          required
          {...register("ciudad")}
        />
        <Input
          label="Estado / Región"
          placeholder="Distrito Capital"
          error={errors.estado_region?.message}
          required
          {...register("estado_region")}
        />
      </div>

      <Input
        label="Dirección"
        placeholder="Av. Principal, N° 123"
        error={errors.direccion?.message}
        required
        {...register("direccion")}
      />

      <SelectorUbicacion
        value={ubicacionActual}
        onChange={(val) => {
          setValue("latitud", val?.latitud ?? null);
          setValue("longitud", val?.longitud ?? null);
          setValue("ubicacion_url", val?.ubicacion_url ?? null);
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Responsable de contacto"
          placeholder="Nombre completo"
          error={errors.contacto_nombre?.message}
          required
          {...register("contacto_nombre")}
        />
        <Input
          label="Teléfono de contacto"
          placeholder="+58 412 0000000"
          error={errors.contacto_telefono?.message}
          required
          {...register("contacto_telefono")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Capacidad máxima"
          type="number"
          min={0}
          error={errors.capacidad_maxima?.message}
          required
          {...register("capacidad_maxima", { valueAsNumber: true })}
        />
        <Input
          label="Personas atendidas actualmente"
          type="number"
          min={0}
          error={errors.personas_atendidas?.message}
          {...register("personas_atendidas", { valueAsNumber: true })}
        />
      </div>

      <Select
        label="Estado del centro"
        options={opcionesEstado}
        error={errors.estado?.message}
        required
        {...register("estado")}
      />

      <Textarea
        label="Observaciones"
        placeholder="Información adicional sobre el centro..."
        {...register("observaciones")}
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          fullWidth
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          {centroExistente ? "Guardar cambios" : "Crear centro"}
        </Button>
      </div>
    </form>
  );
}
