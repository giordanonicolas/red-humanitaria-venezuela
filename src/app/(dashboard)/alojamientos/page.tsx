"use client";

import { useState, useEffect } from "react";
import { Home, Plus, Users, Droplets, Zap, Bath, PawPrint, Baby, Search, ExternalLink, Share2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  obtenerAlojamientos,
  crearAlojamiento,
  actualizarEstadoAlojamiento,
  obtenerFamiliasEsperando,
  registrarFamilia,
} from "@/services/alojamientos";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { SelectorUbicacion } from "@/components/ui/SelectorUbicacion";
import {
  etiquetaEstadoAlojamiento,
  formatearTiempoRelativo,
} from "@/utils/formatters";
import type { Alojamiento, FamiliaAlojamiento, EstadoAlojamiento } from "@/types";

const alojamientoSchema = z.object({
  tipo: z.enum(["patio", "habitacion", "casa", "garaje", "galpon", "espacio_comunitario", "otro"]),
  ciudad: z.string().min(2, "La ciudad es requerida"),
  zona: z.string().optional(),
  capacidad_personas: z.number({ invalid_type_error: "Ingresa un numero" }).min(1),
  acepta_ninos: z.boolean().default(false),
  acepta_mascotas: z.boolean().default(false),
  tiene_agua: z.boolean().default(true),
  tiene_electricidad: z.boolean().default(true),
  tiene_bano: z.boolean().default(true),
  estado: z.enum(["disponible", "ocupado", "no_disponible"]).default("disponible"),
  observaciones: z.string().optional(),
  latitud: z.number().optional().nullable(),
  longitud: z.number().optional().nullable(),
  ubicacion_url: z.string().optional().nullable(),
});

type AlojamientoFormValues = z.infer<typeof alojamientoSchema>;

const familiaSchema = z.object({
  nombre_contacto: z.string().min(2, "El nombre es requerido"),
  cantidad_personas: z.number({ invalid_type_error: "Ingresa un numero" }).min(1),
  tiene_ninos: z.boolean().default(false),
  tiene_mascotas: z.boolean().default(false),
  ciudad_origen: z.string().min(2, "La ciudad es requerida"),
  necesidades_especiales: z.string().optional(),
});

type FamiliaFormValues = z.infer<typeof familiaSchema>;

const opcionesTipo = [
  { value: "habitacion", label: "Habitacion" },
  { value: "casa", label: "Casa" },
  { value: "patio", label: "Patio" },
  { value: "garaje", label: "Garaje" },
  { value: "galpon", label: "Galpon" },
  { value: "espacio_comunitario", label: "Espacio comunitario" },
  { value: "otro", label: "Otro" },
];

const etiquetaTipo: Record<string, string> = {
  habitacion: "Habitacion",
  casa: "Casa",
  patio: "Patio",
  garaje: "Garaje",
  galpon: "Galpon",
  espacio_comunitario: "Espacio comunitario",
  otro: "Otro",
};

const colorEstado: Record<EstadoAlojamiento, "success" | "warning" | "danger"> = {
  disponible: "success",
  ocupado: "warning",
  no_disponible: "danger",
};

function generarMensajeAlojamiento(aloj: Alojamiento): string {
  const tipo = etiquetaTipo[aloj.tipo] || aloj.tipo;
  const estado = etiquetaEstadoAlojamiento(aloj.estado);
  const capacidad = aloj.capacidad_personas;
  const ciudad = aloj.ciudad + (aloj.zona ? ", " + aloj.zona : "");
  const ninos = aloj.acepta_ninos ? "Si" : "No";
  const mascotas = aloj.acepta_mascotas ? "Si" : "No";
  const lineas = [
    "Alojamiento disponible: " + tipo,
    "",
    "Ciudad: " + ciudad,
    "Estado: " + estado,
    "Capacidad: " + capacidad + (capacidad !== 1 ? " personas" : " persona"),
    "Acepta ninos: " + ninos + " | Mascotas: " + mascotas,
  ];
  if (aloj.observaciones) lineas.push(aloj.observaciones);
  if (aloj.ubicacion_url) lineas.push("Como llegar: " + aloj.ubicacion_url);
  lineas.push("", "Compartido desde Red Humanitaria");
  return encodeURIComponent(lineas.join(String.fromCharCode(10)));
}

export default function AlojamientosPage() {
  const [alojamientos, setAlojamientos] = useState<Alojamiento[]>([]);
  const [familias, setFamilias] = useState<FamiliaAlojamiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modalAlojamiento, setModalAlojamiento] = useState(false);
  const [modalFamilia, setModalFamilia] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [perfilId, setPerfilId] = useState<string | null>(null);

  const formAlojamiento = useForm<AlojamientoFormValues>({
    resolver: zodResolver(alojamientoSchema),
    defaultValues: {
      tipo: "habitacion",
      capacidad_personas: 1,
      estado: "disponible",
      acepta_ninos: false,
      acepta_mascotas: false,
      tiene_agua: true,
      tiene_electricidad: true,
      tiene_bano: true,
      latitud: null,
      longitud: null,
      ubicacion_url: null,
    },
  });

  const formFamilia = useForm<FamiliaFormValues>({
    resolver: zodResolver(familiaSchema),
    defaultValues: { cantidad_personas: 1, tiene_ninos: false, tiene_mascotas: false },
  });

  const latActual = formAlojamiento.watch("latitud");
  const lngActual = formAlojamiento.watch("longitud");
  const urlActual = formAlojamiento.watch("ubicacion_url");

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
      const { data: perfil } = await supabase.from("perfiles").select("id").eq("usuario_id", user.id).single();
      if (perfil) setPerfilId(perfil.id);
    }
    const [alojData, famData] = await Promise.all([obtenerAlojamientos(), obtenerFamiliasEsperando()]);
    setAlojamientos(alojData);
    setFamilias(famData);
    setCargando(false);
  }

  const filtrados = alojamientos.filter((a) => {
    const coincideBusqueda = !busqueda || a.ciudad.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = !filtroEstado || a.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  async function onSubmitAlojamiento(valores: AlojamientoFormValues) {
    if (!perfilId) return;
    setErrorForm(null);
    const resultado = await crearAlojamiento(perfilId, {
      ...valores,
      latitud: valores.latitud ?? null,
      longitud: valores.longitud ?? null,
      ubicacion_url: valores.ubicacion_url ?? null,
    } as Parameters<typeof crearAlojamiento>[1]);
    if (resultado.error) { setErrorForm("Error al registrar."); return; }
    setModalAlojamiento(false);
    formAlojamiento.reset();
    await cargarDatos();
  }

  async function onSubmitFamilia(valores: FamiliaFormValues) {
    setErrorForm(null);
    const resultado = await registrarFamilia({
      ...valores,
      necesidades_especiales: valores.necesidades_especiales ?? null,
    });
    if (resultado.error) { setErrorForm("Error al registrar."); return; }
    setModalFamilia(false);
    formFamilia.reset();
    await cargarDatos();
  }

  async function cambiarEstado(id: string, estado: EstadoAlojamiento) {
    await actualizarEstadoAlojamiento(id, estado);
    await cargarDatos();
  }

  function abrirModalAlojamiento() {
    formAlojamiento.reset({
      tipo: "habitacion",
      capacidad_personas: 1,
      estado: "disponible",
      acepta_ninos: false,
      acepta_mascotas: false,
      tiene_agua: true,
      tiene_electricidad: true,
      tiene_bano: true,
      latitud: null,
      longitud: null,
      ubicacion_url: null,
    });
    setErrorForm(null);
    setModalAlojamiento(true);
  }

  const opcionesEstadoFiltro = [
    { value: "", label: "Todos los estados" },
    { value: "disponible", label: "Disponible" },
    { value: "ocupado", label: "Ocupado" },
    { value: "no_disponible", label: "No disponible" },
  ];

  const opcionesEstadoCambio = [
    { value: "disponible", label: "Disponible" },
    { value: "ocupado", label: "Ocupado" },
    { value: "no_disponible", label: "No disponible" },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alojamiento solidario</h1>
          <p className="text-gray-500 mt-0.5">
            {alojamientos.length} espacio{alojamientos.length !== 1 ? "s" : ""} registrado{alojamientos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => { formFamilia.reset(); setErrorForm(null); setModalFamilia(true); }}>
            Necesito alojamiento
          </Button>
          <Button size="sm" onClick={abrirModalAlojamiento}>
            <Plus className="h-4 w-4" />
            Ofrecer espacio
          </Button>
        </div>
      </div>

      {familias.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader title={familias.length + " familia" + (familias.length !== 1 ? "s" : "") + " buscando alojamiento"} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {familias.slice(0, 4).map((familia) => (
              <div key={familia.id} className="bg-white rounded-xl p-3 border border-orange-100">
                <p className="text-sm font-medium text-gray-900">{familia.nombre_contacto}</p>
                <div className="flex gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                  <span>{familia.cantidad_personas} persona{familia.cantidad_personas !== 1 ? "s" : ""}</span>
                  <span>Origen: {familia.ciudad_origen}</span>
                  {familia.tiene_ninos && <span>Con ninos</span>}
                  {familia.tiene_mascotas && <span>Con mascotas</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por ciudad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="sm:w-48">
          <Select
            options={opcionesEstadoFiltro}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          />
        </div>
      </div>

      {cargando ? (
        <PageLoader />
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={Home}
          title="Sin alojamientos registrados"
          description="Todavia no hay espacios disponibles. Podés ser el primero en ofrecer alojamiento solidario."
          action={{ label: "Ofrecer espacio", onClick: abrirModalAlojamiento }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map((aloj) => (
            <div key={aloj.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{etiquetaTipo[aloj.tipo] || aloj.tipo}</p>
                  <p className="text-sm text-gray-500">{aloj.ciudad}{aloj.zona ? ", " + aloj.zona : ""}</p>
                </div>
                <Badge variant={colorEstado[aloj.estado]}>{etiquetaEstadoAlojamiento(aloj.estado)}</Badge>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{aloj.capacidad_personas} persona{aloj.capacidad_personas !== 1 ? "s" : ""}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {aloj.tiene_agua && (
                  <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                    <Droplets className="h-3 w-3" />Agua
                  </span>
                )}
                {aloj.tiene_electricidad && (
                  <span className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">
                    <Zap className="h-3 w-3" />Luz
                  </span>
                )}
                {aloj.tiene_bano && (
                  <span className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-lg">
                    <Bath className="h-3 w-3" />Bano
                  </span>
                )}
                {aloj.acepta_ninos && (
                  <span className="flex items-center gap-1 text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-lg">
                    <Baby className="h-3 w-3" />Ninos
                  </span>
                )}
                {aloj.acepta_mascotas && (
                  <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg">
                    <PawPrint className="h-3 w-3" />Mascotas
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {aloj.ubicacion_url && (
                  <a
                    href={aloj.ubicacion_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Como llegar
                  </a>
                )}
                <a
                  href={"https://wa.me/?text=" + generarMensajeAlojamiento(aloj)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Compartir
                </a>
              </div>

              {aloj.observaciones && (
                <p className="text-sm text-gray-500 line-clamp-2">{aloj.observaciones}</p>
              )}

              <div className="pt-1 border-t border-gray-50">
                <Select
                  options={opcionesEstadoCambio}
                  value={aloj.estado}
                  onChange={(e) => cambiarEstado(aloj.id, e.target.value as EstadoAlojamiento)}
                />
              </div>

              <p className="text-xs text-gray-400">{formatearTiempoRelativo(aloj.creado_en)}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalAlojamiento} onClose={() => setModalAlojamiento(false)} title="Ofrecer espacio" size="lg">
        {errorForm && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{errorForm}</p>
          </div>
        )}
        <form onSubmit={formAlojamiento.handleSubmit(onSubmitAlojamiento)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tipo de espacio"
              options={opcionesTipo}
              error={formAlojamiento.formState.errors.tipo?.message}
              required
              {...formAlojamiento.register("tipo")}
            />
            <Input
              label="Capacidad (personas)"
              type="number"
              min={1}
              error={formAlojamiento.formState.errors.capacidad_personas?.message}
              required
              {...formAlojamiento.register("capacidad_personas", { valueAsNumber: true })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              placeholder="Caracas"
              error={formAlojamiento.formState.errors.ciudad?.message}
              required
              {...formAlojamiento.register("ciudad")}
            />
            <Input
              label="Zona o sector"
              placeholder="Las Mercedes"
              {...formAlojamiento.register("zona")}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Servicios disponibles</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Checkbox label="Agua" {...formAlojamiento.register("tiene_agua")} />
              <Checkbox label="Electricidad" {...formAlojamiento.register("tiene_electricidad")} />
              <Checkbox label="Bano" {...formAlojamiento.register("tiene_bano")} />
              <Checkbox label="Acepta ninos" {...formAlojamiento.register("acepta_ninos")} />
              <Checkbox label="Acepta mascotas" {...formAlojamiento.register("acepta_mascotas")} />
            </div>
          </div>
          <SelectorUbicacion
            value={ubicacionActual}
            onChange={(val) => {
              formAlojamiento.setValue("latitud", val?.latitud ?? null);
              formAlojamiento.setValue("longitud", val?.longitud ?? null);
              formAlojamiento.setValue("ubicacion_url", val?.ubicacion_url ?? null);
            }}
          />
          <Textarea
            label="Observaciones"
            placeholder="Mas informacion sobre el espacio..."
            {...formAlojamiento.register("observaciones")}
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setModalAlojamiento(false)}
              disabled={formAlojamiento.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={formAlojamiento.formState.isSubmitting}>
              Publicar espacio
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={modalFamilia} onClose={() => setModalFamilia(false)} title="Solicitar alojamiento" size="md">
        {errorForm && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{errorForm}</p>
          </div>
        )}
        <form onSubmit={formFamilia.handleSubmit(onSubmitFamilia)} className="space-y-4">
          <Input
            label="Nombre de contacto"
            placeholder="Tu nombre"
            error={formFamilia.formState.errors.nombre_contacto?.message}
            required
            {...formFamilia.register("nombre_contacto")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cantidad de personas"
              type="number"
              min={1}
              error={formFamilia.formState.errors.cantidad_personas?.message}
              required
              {...formFamilia.register("cantidad_personas", { valueAsNumber: true })}
            />
            <Input
              label="Ciudad de origen"
              placeholder="Valencia"
              error={formFamilia.formState.errors.ciudad_origen?.message}
              required
              {...formFamilia.register("ciudad_origen")}
            />
          </div>
          <div className="flex gap-4">
            <Checkbox label="Con ninos" {...formFamilia.register("tiene_ninos")} />
            <Checkbox label="Con mascotas" {...formFamilia.register("tiene_mascotas")} />
          </div>
          <Textarea
            label="Necesidades especiales"
            placeholder="Informacion adicional..."
            {...formFamilia.register("necesidades_especiales")}
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setModalFamilia(false)}
              disabled={formFamilia.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={formFamilia.formState.isSubmitting}>
              Enviar solicitud
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
