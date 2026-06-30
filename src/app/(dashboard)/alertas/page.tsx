"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertTriangle, Package, Home, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatearTiempoRelativo } from "@/utils/formatters";
import type { Alerta } from "@/types";

const iconoPorTipo: Record<string, typeof Bell> = {
  inventario_critico: Package,
  pedido_urgente: AlertTriangle,
  alojamiento_liberado: Home,
  centro_saturado: Building2,
  redistribucion_sugerida: Package,
};

const colorPorPrioridad: Record<string, "danger" | "warning" | "primary" | "success"> = {
  critica: "danger",
  alta: "warning",
  media: "primary",
  baja: "success",
};

const etiquetaTipoAlerta: Record<string, string> = {
  inventario_critico: "Inventario crítico",
  pedido_urgente: "Pedido urgente",
  alojamiento_liberado: "Alojamiento liberado",
  centro_saturado: "Centro saturado",
  redistribucion_sugerida: "Redistribución sugerida",
};

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroPrioridad, setFiltroPrioridad] = useState("");
  const [mostrarResueltas, setMostrarResueltas] = useState(false);

  useEffect(() => {
    cargarAlertas();
  }, []);

  async function cargarAlertas() {
    setCargando(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("alertas")
      .select("*, centro:centros(id, nombre)")
      .order("creado_en", { ascending: false })
      .limit(50);

    setAlertas((data as Alerta[]) || []);
    setCargando(false);
  }

  async function resolverAlerta(id: string) {
    const supabase = createClient();
    await supabase.from("alertas").update({ resuelta: true }).eq("id", id);
    await cargarAlertas();
  }

  const alertasFiltradas = alertas.filter((a) => {
    if (!mostrarResueltas && a.resuelta) return false;
    if (filtroPrioridad && a.prioridad !== filtroPrioridad) return false;
    return true;
  });

  const alertasActivas = alertas.filter((a) => !a.resuelta).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertas</h1>
          <p className="text-gray-500 mt-1">
            {alertasActivas} alerta{alertasActivas !== 1 ? "s" : ""} activa
            {alertasActivas !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {["", "critica", "alta", "media", "baja"].map((p) => (
            <button
              key={p}
              onClick={() => setFiltroPrioridad(p)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                filtroPrioridad === p
                  ? "bg-primary-100 text-primary-700"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p === "" ? "Todas" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setMostrarResueltas(!mostrarResueltas)}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            mostrarResueltas
              ? "bg-green-100 text-green-700"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {mostrarResueltas ? "Ocultar resueltas" : "Ver resueltas"}
        </button>
      </div>

      {cargando ? (
        <PageLoader />
      ) : alertasFiltradas.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={mostrarResueltas ? "Sin alertas" : "Sin alertas activas"}
          description={
            mostrarResueltas
              ? "No hay alertas registradas."
              : "Todo está bajo control. No hay alertas activas."
          }
        />
      ) : (
        <div className="space-y-3">
          {alertasFiltradas.map((alerta) => {
            const Icono = iconoPorTipo[alerta.tipo] || Bell;
            return (
              <div
                key={alerta.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 ${
                  alerta.resuelta ? "opacity-60" : ""
                } ${
                  alerta.prioridad === "critica" && !alerta.resuelta
                    ? "border-red-200"
                    : "border-gray-100"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    alerta.resuelta
                      ? "bg-gray-100"
                      : alerta.prioridad === "critica"
                      ? "bg-red-100"
                      : alerta.prioridad === "alta"
                      ? "bg-orange-100"
                      : "bg-blue-100"
                  }`}
                >
                  <Icono
                    className={`h-5 w-5 ${
                      alerta.resuelta
                        ? "text-gray-400"
                        : alerta.prioridad === "critica"
                        ? "text-red-500"
                        : alerta.prioridad === "alta"
                        ? "text-orange-500"
                        : "text-blue-500"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant={alerta.resuelta ? "success" : colorPorPrioridad[alerta.prioridad]}>
                      {alerta.resuelta ? "Resuelta" : alerta.prioridad}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {etiquetaTipoAlerta[alerta.tipo] || alerta.tipo}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">{alerta.titulo}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{alerta.descripcion}</p>
                  {alerta.centro && (
                    <p className="text-xs text-gray-400 mt-1">
                      Centro: {alerta.centro.nombre}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatearTiempoRelativo(alerta.creado_en)}
                  </p>
                </div>
                {!alerta.resuelta && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resolverAlerta(alerta.id)}
                    className="shrink-0 text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Resolver
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
