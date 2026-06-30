"use client";

import { useState, useEffect } from "react";
import { HeartHandshake, Plus, Search, MapPin, Clock, ExternalLink, AlertTriangle, Share2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { obtenerSolicitudes, crearSolicitud, actualizarEstadoSolicitud } from "@/services/solicitudes";
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
import {
  etiquetaTipoSolicitud,
  etiquetaUrgencia,
  etiquetaEstadoSolicitud,
  formatearTiempoRelativo,
} from "@/utils/formatters";
import type { SolicitudAyuda, TipoSolicitud, UrgenciaSolicitud, EstadoSolicitud } from "@/types";

const solicitudSchema = z.object({
  nombre_solicitante: z.string().min(2, "El nombre es requerido"),
  tipo: z.enum(["alimentos", "agua", "medicamentos", "ropa", "transporte", "alojamiento", "rescate", "otro"]),
  descripcion: z.string().min(5, "Describí la situación"),
  ciudad: z.string().min(2, "La ciudad es requerida"),
  direccion_referencia: z.string().optional(),
  urgencia: z.enum(["critica", "alta", "media", "baja"]).default("media"),
  latitud: z.number().optional().nullable(),
  longitud: z.number().optional().nullable(),
  ubicacion_url: z.string().optional().nullable(),
});

type SolicitudFormValues = z.infer<typeof solicitudSchema>;

const opcionesTipo = [
  { value: "alimentos", label: "Alimentos" },
  { value: "agua", label: "Agua" },
  { value: "medicamentos", label: "Medicamentos" },
  { value: "ropa", label: "Ropa" },
  { value: "transporte", label: "Transporte" },
  { value: "alojamiento", label: "Alojamiento" },
  { value: "rescate", label: "Rescate" },
  { value: "otro", label: "Otro" },
];

const opcionesUrgencia = [
  { value: "critica", label: "🔴 Crítica — en peligro inmediato" },
  { value: "alta", label: "🟠 Alta — necesidad urgente" },
  { value: "media", label: "🟡 Media — situación difícil" },
  { value: "baja", label: "🟢 Baja — puede esperar un poco" },
];

const opcionesEstadoFiltro = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "resuelta", label: "Resuelta" },
  { value: "cancelada", label: "Cancelada" },
];

const opcionesEstadoAccion = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "resuelta", label: "Resuelta" },
  { value: "cancelada", label: "Cancelada" },
];

const colorUrgencia: Record<UrgenciaSolicitud, "danger" | "warning" | "primary" | "success"> = {
  critica: "danger",
  alta: "warning",
  media: "primary",
  baja: "success",
};

const colorEstado: Record<EstadoSolicitud, "default" | "info" | "success" | "danger"> = {
  pendiente: "default",
  en_proceso: "info",
  resuelta: "success",
  cancelada: "danger",
};

const ordenUrgencia: Record<UrgenciaSolicitud, number> = {
  critica: 0,
  alta: 1,
  media: 2,
  baja: 3,
};

function generarMensajeWhatsApp(sol: SolicitudAyuda): string {
  const lineas = [
    `🆘 *Solicitud de ayuda*`,
    ``,
    `📌 *Tipo:* ${etiquetaTipoSolicitud(sol.tipo)}`,
    `⚠️ *Urgencia:* ${etiquetaUrgencia(sol.urgencia)}`,
    `📍 *Ciudad:* ${sol.ciudad}`,
  ];
  if (sol.direccion_referencia) lineas.push(`📌 *Referencia:* ${sol.direccion_referencia}`);
  lineas.push(`📝 ${sol.descripcion}`);
  if (sol.ubicacion_url) lineas.push(`🗺️ *Ubicación:* ${sol.ubicacion_url}`);
  lineas.push(``, `Compartido desde Red Humanitaria`);
  return encodeURIComponent(lineas.join("\n"));
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudAyuda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroUrgencia, setFiltroUrgencia] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [solicitanteId, setSolicitanteId] = useState<string | null>(null);
  const [rolUsuario, setRolUsuario] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudFormValues>({
    resolver: zodResolver(solicitudSchema),
    defaultValues: { urgencia: "media", latitud: null, longitud: null, ubicacion_url: null },
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
      const { data: perfil } = await supabase.from("perfiles").select("id, rol").eq("usuario_id", user.id).single();
      if (perfil) {
        setSolicitanteId(perfil.id);
        setRolUsuario(perfil.rol);
      }
    }
    const data = await obtenerSolicitudes();
    setSolicitudes(data);
    setCargando(false);
  }

  const filtradas = solicitudes
    .filter((s) => {
      const coincideBusqueda =
        !busqueda ||
        s.nombre_solicitante.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.ciudad.toLowerCase().includes(busqueda.toLowerCase());
      const coincideEstado = !filtroEstado || s.estado === filtroEstado;
      const coincideUrgencia = !filtroUrgencia || s.urgencia === filtroUrgencia;
      return coincideBusqueda && coincideEstado && coincideUrgencia;
    })
    .sort((a, b) => ordenUrgencia[a.urgencia] - ordenUrgencia[b.urgencia]);

  async function onSubmit(valores: SolicitudFormValues) {
    setErrorForm(null);
    const resultado = await crearSolicitud({
      ...valores,
      estado: "pendiente",
      solicitante_id: solicitanteId,
      responsable_id: null,
      latitud: valores.latitud ?? null,
      longitud: valores.longitud ?? null,
      ubicacion_url: valores.ubicacion_url ?? null,
      direccion_referencia: valores.direccion_referencia || null,
    } as Parameters<typeof crearSolicitud>[0], solicitanteId || undefined);

    if (resultado.error) { setErrorForm("Error al registrar la solicitud."); return; }
    setModalAbierto(false);
    reset();
    await cargarDatos();
  }

  async function cambiarEstado(id: string, estado: EstadoSolicitud) {
    await actualizarEstadoSolicitud(id, estado);
    await cargarDatos();
  }

  function abrirModal(urgenciaInicial?: UrgenciaSolicitud) {
    reset({
      urgencia: urgenciaInicial ?? "media",
      latitud: null,
      longitud: null,
      ubicacion_url: null,
    });
    setErrorForm(null);
    setModalAbierto(true);
  }

  const puedeGestionar = ["administrador", "responsable_centro"].includes(rolUsuario);
  const urgentesActivas = solicitudes.filter(
    (s) => (s.urgencia === "critica" || s.urgencia === "alta") && s.estado === "pendiente"
  ).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes de ayuda</h1>
          <p className="text-gray-500 mt-0.5">
            {solicitudes.filter((s) => s.estado === "pendiente").length} pendiente
            {solicitudes.filter((s) => s.estado === "pendiente").length !== 1 ? "s" : ""}
            {urgentesActivas > 0 && (
              <span className="ml-2 text-red-600 font-medium">· {urgentesActivas} urgente{urgentesActivas !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => abrirModal("critica")}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm"
          >
            <AlertTriangle className="h-4 w-4" />
            Necesito ayuda
          </button>
          <Button variant="secondary" onClick={() => abrirModal()}>
            <Plus className="h-4 w-4" />
            Nueva solicitud
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, descripción o ciudad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Select
            options={[
              { value: "", label: "Urgencia" },
              { value: "critica", label: "Crítica" },
              { value: "alta", label: "Alta" },
              { value: "media", label: "Media" },
              { value: "baja", label: "Baja" },
            ]}
            value={filtroUrgencia}
            onChange={(e) => setFiltroUrgencia(e.target.value)}
          />
          <Select
            options={opcionesEstadoFiltro}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          />
        </div>
      </div>

      {cargando ? (
        <PageLoader />
      ) : filtradas.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No hay solicitudes"
          description={busqueda || filtroEstado || filtroUrgencia ? "No hay solicitudes con esos filtros." : "Todavía no hay solicitudes registradas. Si alguien necesita ayuda, podés registrarla acá."}
          action={{ label: "Registrar solicitud", onClick: () => abrirModal() }}
        />
      ) : (
        <div className="space-y-3">
          {filtradas.map((sol) => {
            const esCritica = sol.urgencia === "critica";
            const esAlta = sol.urgencia === "alta";
            return (
              <div
                key={sol.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  esCritica
                    ? "border-red-300 shadow-red-100"
                    : esAlta
                    ? "border-orange-200"
                    : "border-gray-100"
                }`}
              >
                {esCritica && (
                  <div className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white text-sm font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    Urgencia crítica — necesita atención inmediata
                  </div>
                )}
                {esAlta && (
                  <div className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white text-sm font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Alta urgencia
                  </div>
                )}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <Badge variant={colorUrgencia[sol.urgencia]}>{etiquetaUrgencia(sol.urgencia)}</Badge>
                        <Badge variant="default">{etiquetaTipoSolicitud(sol.tipo)}</Badge>
                        <Badge variant={colorEstado[sol.estado]}>{etiquetaEstadoSolicitud(sol.estado)}</Badge>
                      </div>
                      <p className="font-semibold text-gray-900">{sol.nombre_solicitante}</p>
                      <p className="text-gray-600 mt-1 text-sm leading-relaxed">{sol.descripcion}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {sol.ciudad}{sol.direccion_referencia ? ` — ${sol.direccion_referencia}` : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {formatearTiempoRelativo(sol.creado_en)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {sol.ubicacion_url && (
                          <a
                            href={sol.ubicacion_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium py-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Cómo llegar
                          </a>
                        )}
                        <a
                          href={`https://wa.me/?text=${generarMensajeWhatsApp(sol)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium py-1"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          Compartir
                        </a>
                      </div>
                    </div>
                    {puedeGestionar && (
                      <div className="shrink-0 w-36 sm:w-40">
                        <Select
                          options={opcionesEstadoAccion}
                          value={sol.estado}
                          onChange={(e) => cambiarEstado(sol.id, e.target.value as EstadoSolicitud)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title="Registrar solicitud de ayuda" size="lg">
        {errorForm && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{errorForm}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Tu nombre o nombre del solicitante"
            placeholder="Nombre completo"
            error={errors.nombre_solicitante?.message}
            required
            {...register("nombre_solicitante")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="¿Qué necesitás?"
              options={opcionesTipo}
              placeholder="Tipo de ayuda"
              error={errors.tipo?.message}
              required
              {...register("tipo")}
            />
            <Select
              label="Urgencia"
              options={opcionesUrgencia}
              error={errors.urgencia?.message}
              required
              {...register("urgencia")}
            />
          </div>
          <Textarea
            label="Describí la situación"
            placeholder="Contanos qué necesitás y por qué..."
            error={errors.descripcion?.message}
            required
            {...register("descripcion")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              placeholder="Maracaibo"
              error={errors.ciudad?.message}
              required
              {...register("ciudad")}
            />
            <Input
              label="Referencia de ubicación"
              placeholder="Av. 5, sector norte..."
              {...register("direccion_referencia")}
            />
          </div>
          <SelectorUbicacion
            value={ubicacionActual}
            onChange={(val) => {
              setValue("latitud", val?.latitud ?? null);
              setValue("longitud", val?.longitud ?? null);
              setValue("ubicacion_url", val?.ubicacion_url ?? null);
            }}
          />
          <div className="flex gap-3 pt-1">
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
              Enviar solicitud
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
