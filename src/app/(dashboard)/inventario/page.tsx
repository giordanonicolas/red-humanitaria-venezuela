"use client";

import { useState, useEffect } from "react";
import { Package, Plus, AlertTriangle, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  obtenerInventario,
  obtenerInventarioCritico,
  crearItemInventario,
  actualizarItemInventario,
  eliminarItemInventario,
} from "@/services/inventario";
import { obtenerCentros } from "@/services/centros";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { inventarioSchema, type InventarioFormValues } from "@/validations/inventario";
import {
  etiquetaCategoria,
  etiquetaPrioridad,
  colorPrioridad,
  calcularPorcentajeInventario,
  formatearFecha,
} from "@/utils/formatters";
import type { ItemInventario, Centro, CategoriaInventario, PrioridadInventario } from "@/types";

const opcionesCategorias = [
  { value: "", label: "Todas las categorías" },
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

const opcionesPrioridad = [
  { value: "critica", label: "Crítica" },
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

const colorBadgePrioridad: Record<string, "danger" | "warning" | "primary" | "success"> = {
  critica: "danger",
  alta: "warning",
  media: "primary",
  baja: "success",
};

export default function InventarioPage() {
  const [items, setItems] = useState<ItemInventario[]>([]);
  const [criticos, setCriticos] = useState<ItemInventario[]>([]);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroCentro, setFiltroCentro] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemEditando, setItemEditando] = useState<ItemInventario | null>(null);
  const [itemEliminando, setItemEliminando] = useState<ItemInventario | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InventarioFormValues>({
    resolver: zodResolver(inventarioSchema),
    defaultValues: { prioridad: "media" },
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    const [itemsData, criticosData, centrosData] = await Promise.all([
      obtenerInventario(),
      obtenerInventarioCritico(),
      obtenerCentros(),
    ]);
    setItems(itemsData);
    setCriticos(criticosData);
    setCentros(centrosData);
    setCargando(false);
  }

  const opcionesCentros = [
    { value: "", label: "Todos los centros" },
    ...centros.map((c) => ({ value: c.id, label: c.nombre })),
  ];

  const opcionesCentrosForm = centros.map((c) => ({
    value: c.id,
    label: c.nombre,
  }));

  const itemsFiltrados = items.filter((item) => {
    const coincideBusqueda =
      !busqueda ||
      item.nombre_item.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria =
      !filtroCategoria || item.categoria === filtroCategoria;
    const coincideCentro =
      !filtroCentro || item.centro_id === filtroCentro;
    return coincideBusqueda && coincideCategoria && coincideCentro;
  });

  function abrirCrear() {
    setItemEditando(null);
    setErrorForm(null);
    reset({ prioridad: "media" });
    setModalAbierto(true);
  }

  function abrirEditar(item: ItemInventario) {
    setItemEditando(item);
    setErrorForm(null);
    reset({
      centro_id: item.centro_id,
      categoria: item.categoria,
      nombre_item: item.nombre_item,
      cantidad_disponible: item.cantidad_disponible,
      cantidad_necesaria: item.cantidad_necesaria,
      unidad: item.unidad,
      prioridad: item.prioridad,
      observaciones: item.observaciones || "",
    });
    setModalAbierto(true);
  }

  async function onSubmit(valores: InventarioFormValues) {
    setErrorForm(null);
    let resultado;

    if (itemEditando) {
      resultado = await actualizarItemInventario(itemEditando.id, valores);
    } else {
      resultado = await crearItemInventario(valores);
    }

    if (resultado.error) {
      setErrorForm("Error al guardar. Intentá de nuevo.");
      return;
    }

    setModalAbierto(false);
    await cargarDatos();
  }

  async function handleEliminar() {
    if (!itemEliminando) return;
    setEliminando(true);
    await eliminarItemInventario(itemEliminando.id);
    setEliminando(false);
    setItemEliminando(null);
    await cargarDatos();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} registrado
            {items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="h-4 w-4" />
          Nuevo item
        </Button>
      </div>

      {criticos.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader
            title={`⚠️ ${criticos.length} item${criticos.length !== 1 ? "s" : ""} en estado crítico`}
            subtitle="Stocks por debajo del 20% de lo necesario"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {criticos.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 bg-white rounded-xl p-3 border border-red-100"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.nombre_item}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.centro?.nombre} — {etiquetaCategoria(item.categoria)}
                  </p>
                </div>
                <Badge variant="danger">
                  {calcularPorcentajeInventario(
                    item.cantidad_disponible,
                    item.cantidad_necesaria
                  )}
                  %
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="sm:w-48">
          <Select
            options={opcionesCentros}
            value={filtroCentro}
            onChange={(e) => setFiltroCentro(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <Select
            options={opcionesCategorias}
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          />
        </div>
      </div>

      {cargando ? (
        <PageLoader />
      ) : itemsFiltrados.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin items en inventario"
          description="Registrá los primeros items del inventario."
          action={{ label: "Agregar item", onClick: abrirCrear }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Item
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Centro
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Prioridad
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Actualizado
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {itemsFiltrados.map((item) => {
                  const porcentaje = calcularPorcentajeInventario(
                    item.cantidad_disponible,
                    item.cantidad_necesaria
                  );
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {item.nombre_item}
                        </p>
                        <p className="text-xs text-gray-500">
                          {etiquetaCategoria(item.categoria)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">
                          {item.centro?.nombre}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.centro?.ciudad}
                        </p>
                      </td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <p className="text-sm text-gray-700 mb-1">
                          {item.cantidad_disponible} / {item.cantidad_necesaria}{" "}
                          {item.unidad}
                        </p>
                        <ProgressBar
                          value={item.cantidad_disponible}
                          max={item.cantidad_necesaria || 1}
                          showLabel
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={colorBadgePrioridad[item.prioridad]}>
                          {etiquetaPrioridad(item.prioridad)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {formatearFecha(item.fecha_actualizacion)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirEditar(item)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setItemEliminando(item)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={itemEditando ? "Editar item" : "Nuevo item de inventario"}
        size="lg"
      >
        {errorForm && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{errorForm}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Centro"
            options={opcionesCentrosForm}
            placeholder="Seleccioná un centro"
            error={errors.centro_id?.message}
            required
            {...register("centro_id")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Categoría"
              options={opcionesCategorias.slice(1)}
              placeholder="Seleccioná una categoría"
              error={errors.categoria?.message}
              required
              {...register("categoria")}
            />
            <Input
              label="Nombre del item"
              placeholder="Agua mineral 500ml"
              error={errors.nombre_item?.message}
              required
              {...register("nombre_item")}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Disponible"
              type="number"
              min={0}
              step="0.01"
              error={errors.cantidad_disponible?.message}
              required
              {...register("cantidad_disponible", { valueAsNumber: true })}
            />
            <Input
              label="Necesario"
              type="number"
              min={0}
              step="0.01"
              error={errors.cantidad_necesaria?.message}
              required
              {...register("cantidad_necesaria", { valueAsNumber: true })}
            />
            <Input
              label="Unidad"
              placeholder="litros"
              error={errors.unidad?.message}
              required
              {...register("unidad")}
            />
          </div>
          <Select
            label="Prioridad"
            options={opcionesPrioridad}
            error={errors.prioridad?.message}
            {...register("prioridad")}
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
              {itemEditando ? "Guardar cambios" : "Agregar item"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!itemEliminando}
        onClose={() => setItemEliminando(null)}
        onConfirm={handleEliminar}
        title="Eliminar item"
        description={`¿Confirmás que querés eliminar "${itemEliminando?.nombre_item}" del inventario?`}
        confirmLabel="Eliminar"
        loading={eliminando}
      />
    </div>
  );
}
