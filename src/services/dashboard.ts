import { createClient } from "@/lib/supabase/client";
import type { EstadisticasDashboard, Alerta, SugerenciaRedistribucion } from "@/types";

export async function obtenerEstadisticasDashboard(): Promise<EstadisticasDashboard> {
  const supabase = createClient();

  const [
    centros,
    voluntarios,
    solicitudesUrgentes,
    familiasEsperando,
    alojamientosDisponibles,
    donacionesRecibidas,
    donacionesPendientes,
  ] = await Promise.all([
    supabase
      .from("centros")
      .select("id", { count: "exact" })
      .eq("activo", true)
      .in("estado", ["activo", "saturado", "necesita_apoyo"]),
    supabase
      .from("voluntarios")
      .select("id", { count: "exact" })
      .eq("activo", true),
    supabase
      .from("solicitudes_ayuda")
      .select("id", { count: "exact" })
      .in("urgencia", ["critica", "alta"])
      .eq("estado", "pendiente"),
    supabase
      .from("familias_alojamiento")
      .select("id", { count: "exact" })
      .eq("estado", "buscando"),
    supabase
      .from("alojamientos")
      .select("id", { count: "exact" })
      .eq("estado", "disponible"),
    supabase
      .from("donaciones")
      .select("id", { count: "exact" })
      .in("estado", ["entregado", "recibido"]),
    supabase
      .from("donaciones")
      .select("id", { count: "exact" })
      .in("estado", ["pendiente", "en_camino"]),
  ]);

  return {
    centros_activos: centros.count ?? 0,
    total_voluntarios: voluntarios.count ?? 0,
    solicitudes_urgentes: solicitudesUrgentes.count ?? 0,
    familias_esperando: familiasEsperando.count ?? 0,
    alojamientos_disponibles: alojamientosDisponibles.count ?? 0,
    donaciones_recibidas: donacionesRecibidas.count ?? 0,
    donaciones_pendientes: donacionesPendientes.count ?? 0,
  };
}

export async function obtenerAlertasActivas(): Promise<Alerta[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("alertas")
    .select("*, centro:centros(id, nombre)")
    .eq("resuelta", false)
    .order("creado_en", { ascending: false })
    .limit(10);

  return (data as Alerta[]) || [];
}

export async function obtenerSugerenciasRedistribucion(): Promise<SugerenciaRedistribucion[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("sugerencias_redistribucion")
    .select(`
      *,
      centro_origen:centros!centro_origen_id(id, nombre, ciudad),
      centro_destino:centros!centro_destino_id(id, nombre, ciudad)
    `)
    .eq("estado", "pendiente")
    .order("creado_en", { ascending: false })
    .limit(5);

  return (data as SugerenciaRedistribucion[]) || [];
}

export async function obtenerUltimosMovimientos() {
  const supabase = createClient();

  const [solicitudes, donaciones] = await Promise.all([
    supabase
      .from("solicitudes_ayuda")
      .select("id, tipo, ciudad, urgencia, estado, creado_en, nombre_solicitante")
      .order("creado_en", { ascending: false })
      .limit(5),
    supabase
      .from("donaciones")
      .select("id, categoria, descripcion, estado, creado_en, nombre_donante")
      .order("creado_en", { ascending: false })
      .limit(5),
  ]);

  const movimientos = [
    ...(solicitudes.data || []).map((s) => ({
      ...s,
      tipo_movimiento: "solicitud" as const,
    })),
    ...(donaciones.data || []).map((d) => ({
      ...d,
      tipo_movimiento: "donacion" as const,
    })),
  ].sort(
    (a, b) =>
      new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime()
  );

  return movimientos.slice(0, 8);
}
