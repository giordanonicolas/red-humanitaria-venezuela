import { createClient } from "@/lib/supabase/client";
import type { Centro, FiltrosCentros } from "@/types";
import type { CentroFormValues } from "@/validations/centros";

export async function obtenerCentros(filtros?: FiltrosCentros): Promise<Centro[]> {
  const supabase = createClient();

  let query = supabase
    .from("centros")
    .select("*, responsable:perfiles(id, nombre_completo, alias)")
    .eq("activo", true)
    .order("nombre");

  if (filtros?.ciudad) {
    query = query.ilike("ciudad", `%${filtros.ciudad}%`);
  }
  if (filtros?.estado) {
    query = query.eq("estado", filtros.estado);
  }
  if (filtros?.busqueda) {
    query = query.or(
      `nombre.ilike.%${filtros.busqueda}%,ciudad.ilike.%${filtros.busqueda}%`
    );
  }

  const { data } = await query;
  return (data as Centro[]) || [];
}

export async function obtenerCentro(id: string): Promise<Centro | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from("centros")
    .select("*, responsable:perfiles(id, nombre_completo, alias)")
    .eq("id", id)
    .single();

  return data as Centro | null;
}

export async function crearCentro(valores: CentroFormValues): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("centros").insert(valores);

  if (error) return { error: error.message };
  return { error: null };
}

export async function actualizarCentro(
  id: string,
  valores: Partial<CentroFormValues>
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("centros")
    .update({ ...valores, actualizado_en: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function desactivarCentro(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("centros")
    .update({ activo: false, actualizado_en: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}
