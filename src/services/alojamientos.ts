import { createClient } from "@/lib/supabase/client";
import type { Alojamiento, FamiliaAlojamiento, FiltrosAlojamientos } from "@/types";

export async function obtenerAlojamientos(filtros?: FiltrosAlojamientos): Promise<Alojamiento[]> {
  const supabase = createClient();

  let query = supabase
    .from("alojamientos")
    .select("*, anfitriion:perfiles(id, nombre_completo, alias, telefono, telefono_visible)")
    .order("creado_en", { ascending: false });

  if (filtros?.ciudad) query = query.ilike("ciudad", `%${filtros.ciudad}%`);
  if (filtros?.estado) query = query.eq("estado", filtros.estado);
  if (filtros?.acepta_ninos) query = query.eq("acepta_ninos", true);
  if (filtros?.acepta_mascotas) query = query.eq("acepta_mascotas", true);

  const { data } = await query;
  return (data as Alojamiento[]) || [];
}

export async function crearAlojamiento(
  anfitriion_id: string,
  valores: Omit<Alojamiento, "id" | "creado_en" | "actualizado_en" | "anfitriion_id" | "anfitriion" | "familias_asignadas">
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("alojamientos").insert({
    ...valores,
    anfitriion_id,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function actualizarEstadoAlojamiento(
  id: string,
  estado: Alojamiento["estado"]
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("alojamientos")
    .update({ estado, actualizado_en: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function obtenerFamiliasEsperando(): Promise<FamiliaAlojamiento[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("familias_alojamiento")
    .select("*")
    .eq("estado", "buscando")
    .order("creado_en", { ascending: false });

  return (data as FamiliaAlojamiento[]) || [];
}

export async function registrarFamilia(
  valores: Pick<FamiliaAlojamiento, "nombre_contacto" | "cantidad_personas" | "tiene_ninos" | "tiene_mascotas" | "ciudad_origen" | "necesidades_especiales">
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("familias_alojamiento").insert(valores);

  if (error) return { error: error.message };
  return { error: null };
}

export async function asignarFamiliaAAlojamiento(
  familia_id: string,
  alojamiento_id: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("familias_alojamiento")
    .update({
      alojamiento_asignado_id: alojamiento_id,
      estado: "asignada",
    })
    .eq("id", familia_id);

  if (error) return { error: error.message };

  await supabase
    .from("alojamientos")
    .update({ estado: "ocupado", actualizado_en: new Date().toISOString() })
    .eq("id", alojamiento_id);

  return { error: null };
}
