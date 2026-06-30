import { createClient } from "@/lib/supabase/client";
import type { SolicitudAyuda, FiltrosSolicitudes } from "@/types";

export async function obtenerSolicitudes(filtros?: FiltrosSolicitudes): Promise<SolicitudAyuda[]> {
  const supabase = createClient();

  let query = supabase
    .from("solicitudes_ayuda")
    .select(`
      *,
      solicitante:perfiles!solicitante_id(id, nombre_completo, alias),
      responsable:perfiles!responsable_id(id, nombre_completo, alias)
    `)
    .order("urgencia", { ascending: true })
    .order("creado_en", { ascending: false });

  if (filtros?.tipo) query = query.eq("tipo", filtros.tipo);
  if (filtros?.urgencia) query = query.eq("urgencia", filtros.urgencia);
  if (filtros?.estado) query = query.eq("estado", filtros.estado);
  if (filtros?.ciudad) query = query.ilike("ciudad", `%${filtros.ciudad}%`);

  const { data } = await query;
  return (data as SolicitudAyuda[]) || [];
}

export async function crearSolicitud(
  valores: Omit<SolicitudAyuda, "id" | "creado_en" | "actualizado_en" | "solicitante" | "responsable">,
  solicitante_id?: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("solicitudes_ayuda").insert({
    ...valores,
    solicitante_id: solicitante_id || null,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function actualizarEstadoSolicitud(
  id: string,
  estado: SolicitudAyuda["estado"],
  responsable_id?: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("solicitudes_ayuda")
    .update({
      estado,
      responsable_id: responsable_id || undefined,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}
