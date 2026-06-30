"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Car, Utensils, Stethoscope, Building2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { obtenerVoluntarios, registrarVoluntario } from "@/services/voluntarios";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { voluntarioSchema, type VoluntarioFormValues } from "@/validations/voluntarios";
import type { Voluntario } from "@/types";

const opcionesDisponibilidad = [
  { value: "inmediata", label: "Disponibilidad inmediata" },
  { value: "fines_semana", label: "Fines de semana" },
  { value: "entre_semana", label: "Entre semana" },
  { value: "flexible", label: "Flexible" },
];

const etiquetaDisponibilidad: Record<string, string> = {
  inmediata: "Inmediata",
  fines_semana: "Fines de semana",
  entre_semana: "Entre semana",
  flexible: "Flexible",
};

export default function VoluntariosPage() {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [perfilId, setPerfilId] = useState<string | null>(null);
  const [tieneVehiculo, setTieneVehiculo] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VoluntarioFormValues>({
    resolver: zodResolver(voluntarioSchema),
    defaultValues: {
      disponibilidad: "flexible",
      tiene_vehiculo: false,
      puede_transportar: false,
      puede_ayudar_centro: true,
      puede_cocinar: false,
      puede_asistir_medicamente: false,
    },
  });

  const watchTieneVehiculo = watch("tiene_vehiculo");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("id")
        .eq("usuario_id", user.id)
        .single();
      if (perfil) setPerfilId(perfil.id);
    }

    const data = await obtenerVoluntarios();
    setVoluntarios(data);
    setCargando(false);
  }

  const voluntariosFiltrados = voluntarios.filter(
    (v) =>
      !busqueda ||
      v.perfil?.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.perfil?.ciudad?.toLowerCase().includes(busqueda.toLowerCase())
  );

  async function onSubmit(valores: VoluntarioFormValues) {
    if (!perfilId) return;
    setErrorForm(null);
    const resultado = await registrarVoluntario(perfilId, valores);
    if (resultado.error) {
      setErrorForm("Error al registrar. Intentá de nuevo.");
      return;
    }
    setModalAbierto(false);
    reset();
    await cargarDatos();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voluntarios</h1>
          <p className="text-gray-500 mt-1">
            {voluntarios.length} voluntario{voluntarios.length !== 1 ? "s" : ""} activo
            {voluntarios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { reset(); setErrorForm(null); setModalAbierto(true); }}>
          <Plus className="h-4 w-4" />
          Registrarme
        </Button>
      </div>

      <Input
        placeholder="Buscar por nombre o ciudad..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {cargando ? (
        <PageLoader />
      ) : voluntariosFiltrados.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin voluntarios"
          description="Sé el primero en registrarte como voluntario."
          action={{ label: "Registrarme", onClick: () => setModalAbierto(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {voluntariosFiltrados.map((voluntario) => (
            <div
              key={voluntario.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {voluntario.perfil?.alias || voluntario.perfil?.nombre_completo}
                  </p>
                  {voluntario.perfil?.ciudad && (
                    <p className="text-sm text-gray-500">{voluntario.perfil.ciudad}</p>
                  )}
                </div>
                <Badge variant="success">
                  {etiquetaDisponibilidad[voluntario.disponibilidad] || voluntario.disponibilidad}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {voluntario.puede_ayudar_centro && (
                  <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                    <Building2 className="h-3 w-3" />
                    En centros
                  </div>
                )}
                {voluntario.puede_transportar && (
                  <div className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-lg">
                    <Car className="h-3 w-3" />
                    Transporte
                  </div>
                )}
                {voluntario.puede_cocinar && (
                  <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg">
                    <Utensils className="h-3 w-3" />
                    Cocina
                  </div>
                )}
                {voluntario.puede_asistir_medicamente && (
                  <div className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded-lg">
                    <Stethoscope className="h-3 w-3" />
                    Médico
                  </div>
                )}
              </div>
              {voluntario.tiene_vehiculo && voluntario.tipo_vehiculo && (
                <p className="text-xs text-gray-500">
                  Vehículo: {voluntario.tipo_vehiculo}
                </p>
              )}
              {voluntario.observaciones && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {voluntario.observaciones}
                </p>
              )}
              {voluntario.perfil?.telefono_visible && voluntario.perfil?.telefono && (
                <p className="text-sm text-gray-600 font-medium">
                  {voluntario.perfil.telefono}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrarme como voluntario"
        size="lg"
      >
        {errorForm && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{errorForm}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Select
            label="Disponibilidad"
            options={opcionesDisponibilidad}
            error={errors.disponibilidad?.message}
            {...register("disponibilidad")}
          />

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">¿Qué podés hacer?</p>
            <Checkbox
              label="Ayudar en centros"
              {...register("puede_ayudar_centro")}
            />
            <Checkbox
              label="Cocinar"
              {...register("puede_cocinar")}
            />
            <Checkbox
              label="Asistencia médica"
              {...register("puede_asistir_medicamente")}
            />
            <Checkbox
              label="Tengo vehículo"
              {...register("tiene_vehiculo")}
            />
            {watchTieneVehiculo && (
              <>
                <Input
                  label="Tipo de vehículo"
                  placeholder="Moto, auto, camioneta..."
                  {...register("tipo_vehiculo")}
                />
                <Checkbox
                  label="Puedo transportar donaciones"
                  {...register("puede_transportar")}
                />
              </>
            )}
          </div>

          <Textarea
            label="Observaciones"
            placeholder="Contanos más sobre vos o tu disponibilidad..."
            {...register("observaciones")}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setModalAbierto(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={isSubmitting}>
              Registrarme
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
