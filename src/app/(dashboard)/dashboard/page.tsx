"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  AlertTriangle,
  Home,
  Gift,
  Clock,
  Bell,
  ArrowRight,
  Package,
  HeartHandshake,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  obtenerEstadisticasDashboard,
  obtenerAlertasActivas,
  obtenerSugerenciasRedistribucion,
  obtenerUltimosMovimientos,
} from "@/services/dashboard";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import {
  etiquetaUrgencia,
  etiquetaTipoSolicitud,
  etiquetaCategoria,
  etiquetaEstadoDonacion,
  formatearTiempoRelativo,
} from "@/utils/formatters";
import type {
  EstadisticasDashboard,
  Alerta,
  SugerenciaRedistribucion,
} from "@/types";

const accionesRapidas = [
  { href: "/solicitudes", label: "Pedir ayuda", icon: HeartHandshake, color: "text-red-600 bg-red-50 hover:bg-red-100" },
  { href: "/centros", label: "Centros", icon: Building2, color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
  { href: "/alojamientos", label: "Alojamiento", icon: Home, color: "text-green-600 bg-green-50 hover:bg-green-100" },
  { href: "/donaciones", label: "Donaciones", icon: Gift, color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
];

export default function DashboardPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasDashboard | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [sugerencias, setSugerencias] = useState<SugerenciaRedistribucion[]>([]);
  type Movimiento = Awaited<ReturnType<typeof obtenerUltimosMovimientos>>[number];
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      const [stats, alertasData, sugsData, movData] = await Promise.all([
        obtenerEstadisticasDashboard(),
        obtenerAlertasActivas(),
        obtenerSugerenciasRedistribucion(),
        obtenerUltimosMovimientos(),
      ]);
      setEstadisticas(stats);
      setAlertas(alertasData);
      setSugerencias(sugsData);
      setMovimientos(movData);
      setCargando(false);
    }
    cargarDatos();
  }, []);

  if (cargando) return <PageLoader />;
  if (!estadisticas) return null;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel principal</h1>
        <p className="text-gray-500 mt-0.5">Resumen general de la situación actual</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {accionesRapidas.map((accion) => (
          <Link
            key={accion.href}
            href={accion.href}
            className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl transition-colors ${accion.color}`}
          >
            <accion.icon className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="text-xs sm:text-sm font-semibold text-center leading-tight">{accion.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Centros activos"
          value={estadisticas.centros_activos}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Voluntarios"
          value={estadisticas.total_voluntarios}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Pedidos urgentes"
          value={estadisticas.solicitudes_urgentes}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Familias esperando"
          value={estadisticas.familias_esperando}
          icon={Home}
          color="orange"
        />
        <StatCard
          title="Alojamientos libres"
          value={estadisticas.alojamientos_disponibles}
          icon={Home}
          color="teal"
        />
        <StatCard
          title="Donaciones recibidas"
          value={estadisticas.donaciones_recibidas}
          icon={Gift}
          color="green"
        />
        <StatCard
          title="Donaciones pendientes"
          value={estadisticas.donaciones_pendientes}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Alertas activas"
          value={alertas.length}
          icon={Bell}
          color="red"
        />
      </div>

      {alertas.length > 0 && (
        <Card>
          <CardHeader
            title="Alertas activas"
            action={
              <Link
                href="/alertas"
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <div className="space-y-2">
            {alertas.slice(0, 5).map((alerta) => (
              <div
                key={alerta.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
              >
                <Bell className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{alerta.titulo}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{alerta.descripcion}</p>
                </div>
                <Badge variant="danger" className="shrink-0">{alerta.prioridad}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {alertas.length === 0 && sugerencias.length === 0 && movimientos.length === 0 && (
        <Card>
          <div className="py-8 text-center">
            <HeartHandshake className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Todo tranquilo por ahora</p>
            <p className="text-gray-400 text-sm mt-1">Las alertas y movimientos recientes aparecerán aquí</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/centros"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar primer centro
              </Link>
              <Link
                href="/solicitudes"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <HeartHandshake className="h-4 w-4" />
                Registrar solicitud
              </Link>
            </div>
          </div>
        </Card>
      )}

      {sugerencias.length > 0 && (
        <Card>
          <CardHeader
            title="Redistribución sugerida"
            subtitle="Oportunidades de optimización detectadas"
          />
          <div className="space-y-3">
            {sugerencias.map((sug) => (
              <div key={sug.id} className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {sug.nombre_item} — {sug.cantidad_sugerida} {sug.unidad}
                  </span>
                </div>
                <p className="text-xs text-gray-600 pl-6">
                  De: <span className="font-medium">{sug.centro_origen?.nombre}</span>
                  {" → "}
                  <span className="font-medium">{sug.centro_destino?.nombre}</span>
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {movimientos.length > 0 && (
        <Card>
          <CardHeader title="Últimos movimientos" />
          <div className="divide-y divide-gray-50">
            {movimientos.map((mov) => (
              <div key={mov.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="p-2 rounded-xl bg-gray-100 shrink-0">
                  {mov.tipo_movimiento === "solicitud" ? (
                    <HeartHandshake className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Gift className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {mov.tipo_movimiento === "solicitud"
                      ? `Solicitud de ${etiquetaTipoSolicitud((mov as { tipo: string }).tipo as Parameters<typeof etiquetaTipoSolicitud>[0])} — ${"ciudad" in mov ? mov.ciudad : ""}`
                      : `Donación de ${"categoria" in mov ? etiquetaCategoria((mov as { categoria: string }).categoria as Parameters<typeof etiquetaCategoria>[0]) : ""}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {"nombre_solicitante" in mov
                      ? mov.nombre_solicitante
                      : "nombre_donante" in mov
                      ? mov.nombre_donante
                      : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {mov.tipo_movimiento === "solicitud" ? (
                    <Badge
                      variant={
                        (mov as { urgencia: string }).urgencia === "critica"
                          ? "danger"
                          : (mov as { urgencia: string }).urgencia === "alta"
                          ? "warning"
                          : "default"
                      }
                    >
                      {etiquetaUrgencia((mov as { urgencia: string }).urgencia as Parameters<typeof etiquetaUrgencia>[0])}
                    </Badge>
                  ) : (
                    <Badge variant="info">
                      {etiquetaEstadoDonacion((mov as { estado: string }).estado as Parameters<typeof etiquetaEstadoDonacion>[0])}
                    </Badge>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatearTiempoRelativo(mov.creado_en)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
