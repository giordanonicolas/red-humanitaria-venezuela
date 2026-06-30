"use client";

import { useState, useEffect } from "react";
import { Gift, Plus, Search, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { obtenerDonaciones, crearDonacion, actualizarEstadoDonacion } from "@/services/donaciones";
import { obtenerCentros } from "@/services/centros";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { SelectorUbicacion } from "@/components/ui/SelectorUbicacion";
import { donacionSchema, type DonacionFormValues } from "@/validations/donaciones";
import {
  etiquetaCategoria,
  etiquetaEstadoDonacion,
  formatearFechaHora,
} from "@/utils/formatters";
import type { Donacion, Centro, EstadoDonacion } from "@/types";

const opcionesEstadoFiltro = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_camino", label: "En camino" },
  { value: "entregado", label: "Entregado" },
  { value: "recibido", label: "Recibido" },
];

const opcionesEstadoForm = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_camino", label: "En camino" },
  { value: "entregado", label: "Entregado" },
  { value: "recibido", label: "Recibido" },
];

const opcionesCategorias = [
  { value: "agua", label: "Agua" },
  { value: "alimentos", label: "Alimentos" },
  { value: "medicamentos", label: "Medicamentos" },
  { value: "insumos_medicos", label: "Insumos médicos" },
  { value: "ropa", label: "Ropa" },
  { value: "calzado", label: "Calzado" },
  { value: "higiene", label: "Higiene" },
  { value: "panales", label: "Pañales" },
  { value: "colchones", label: "Colchones" },
  { value: "frazadas", label: "Frazadas" },
  { value: "carpas", label: "Carpas" },
  { value: "linternas", label: "Linternas" },
  { value: "baterias", label: "Baterías" },
  { value: "gas", label: "Gas" },
  { value: "combustible", label: "Combustible" },
  { value: "herramientas", label: "Herramientas" },
  { value: "otros", label: "Otros" },
];

const colorEstado: Record<EstadoDonacion, "default" | "warning" | "info" | "success"> = {
  pendiente: "default",
  en_camino: "warning",
  entregado: "info",
  recibido: "success",
};

export default function DonacionesPage() {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [donanteId, setDonanteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DonacionFormValues>({
    resolver: zodResolver(donacionSchema),
    defaultValues: { estado: "pendiente", latitud: null, longitud: null, ubicacion_url: null },
  });

  const latActual = watch("latitud");
  const lngActual = watch("longitud");
  const urlActual = watch("ubicacion_url");

  const ubicacionActual =
    latActual != null && lngActual != null && urlActual
      ? { latitud: latActual, longitud: lngActual, ubicacion_url: urlActual }
      : null;

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
      if (perfil) setDonanteId(perfil.id);
    }

    const [donacionesData, centrosData] = await Promise.all([
      obtenerDonaciones(),
      obtenerCentros(),
    ]);
    setDonaciones(donacionesData);
    setCentros(centrosData);
    setCargando(false);
  }

  const opcionesCentros = [
    { value: "", label: "Sin destino específico" },
    ...centros.map((c) => ({ value: c.id, label: `${c.nombre} — ${c.ciudad}` })),
  ];

  const donacionesFiltradas = donaciones.filter((d) => {
    const coincideBusqueda =
      !busqueda ||
      d.nombre_donante.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = !filtroEstado || d.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  async function onSubmit(valores: DonacionFormValues) {
    setErrorForm(null);
    const resultado = await crearDonacion(
      { ...valores, centro_destino_id: valores.centro_destino_id || null },
      donanteId || undefined
    );
    if (resultado.error) {
      setErrorForm("Error al registrar la donación.");
      return;
    }
    setModalAbierto(false);
    reset();
    await cargarDatos();
  }

  async function cambiarEstado(id: string, estado: EstadoDonacion) {
    await actualizarEstadoDonacion(id, estado);
    await cargarDatos();
  }

  function abrirModal() {
    reset({ estado: "pendiente", latitud: null, longitud: null, ubicacion_url: null });
    setErrorForm(null);
    setModalAbierto(true);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donaciones</h1>
          <p className="text-gray-500 mt-1">
            {donaciones.length} donación{donaciones.length !== 1 ? "es" : ""} registrada
            {donaciones.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={abrirModal}>
          <Plus className="h-4 w-4" />
          Registrar donación
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por donante o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="sm:w-52">
          <Select
            options={opcionesEstadoFiltro}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          />
        </div>
      </div>

      {cargando ? (
        <PageLoader />
      ) : donacionesFiltradas.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Sin donaciones"
          description="No hay donaciones registradas con esos filtros."
          action={{ label: "Registrar donación", onClick: abrirModal }}
        />
      ) : (
        <div className="space-y-3">
          {donacionesFiltradas.map((donacion) => (
            <div
              key={donacion.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold text-gray-900">
                      {donacion.nombre_donante}
                    </p>
                    <Badge variant="default">
                      {etiquetaCategoria(donacion.categoria)}
                    </Badge>
                    <Badge variant={colorEstado[donacion.estado]}>
                      {etiquetaEstadoDonacion(donacion.estado)}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">{donacion.descripcion}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <span>
                      Cantidad: <strong className="text-gray-700">{donacion.cantidad} {donacion.unidad}</strong>
                    </span>
                    {donacion.centro_destino && (
                      <span>
                        Destino: <strong className="text-gray-700">{donacion.centro_destino.nombre}</strong>
                      </span>
                    )}
                    <span>{formatearFechaHora(donacion.creado_en)}</span>
                    {donacion.ubicacion_url && (
                      <a href={donacion.ubicacion_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver ubicación
                      </a>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <Select
                    options={opcionesEstadoForm}
                    value={donacion.estado}
                    onChange={(e) => cambiarEstado(donacion.id, e.target.value as EstadoDonacion)}
                    className="text-sm py-2 min-h-0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrar donación"
        size="lg"
      >
        {errorForm && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{errorForm}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre del donante"
            placeholder="Tu nombre o alias"
            error={errors.nombre_donante?.message}
            required
            {...register("nombre_donante")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Categoría"
              options={opcionesCategorias}
              placeholder="Seleccioná una categoría"
              error={errors.categoria?.message}
              required
              {...register("categoria")}
            />
            <Select
              label="Estado inicial"
              options={opcionesEstadoForm}
              error={errors.estado?.message}
              {...register("estado")}
            />
          </div>
          <Textarea
            label="Descripción"
            placeholder="Detallá qué estás donando..."
            error={errors.descripcion?.message}
            required
            {...register("descripcion")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cantidad"
              type="number"
              min={0}
              step="0.01"
              error={errors.cantidad?.message}
              required
              {...register("cantidad", { valueAsNumber: true })}
            />
            <Input
              label="Unidad"
              placeholder="litros, kg, unidades..."
              error={errors.unidad?.message}
              required
              {...register("unidad")}
            />
          </div>
          <Select
            label="Centro de destino"
            options={opcionesCentros}
            {...register("centro_destino_id")}
          />
          <SelectorUbicacion
            value={ubicacionActual}
            onChange={(val) => {
              setValue("latitud", val?.latitud ?? null);
              setValue("longitud", val?.longitud ?? null);
              setValue("ubicacion_url", val?.ubicacion_url ?? null);
            }}
          />
          <Textarea
            label="Observaciones"
            placeholder="Información adicional..."
            {...register("observaciones")}
          />
          <div className="flex gap-3 pt-2">
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
              Registrar donación
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
