import { createClient } from "@/lib/supabase/client";
import type { Voluntario, FiltrosVoluntarios } from "@/types";
import type { VoluntarioFormValues } from "@/validations/voluntarios";

export async function obtenerVoluntarios(filtros?: FiltrosVoluntarios): Promise<Voluntario[]> {
  const supabase = createClient();

  let query = supabase
    .from("voluntarios")
    .select(`
      *,
      perfil:perfiles(id, nombre_completo, alias, telefono, telefono_visible, ciudad)
    `)
    .eq("activo", true)
    .order("creado_en", { ascending: false });

  if (filtros?.disponibilidad) query = query.eq("disponibilidad", filtros.disponibilidad);
  if (filtros?.puede_transportar) query = query.eq("puede_transportar", true);
  if (filtros?.puede_asistir_medicamente) query = query.eq("puede_asistir_medicamente", true);

  const { data } = await query;
  return (data as Voluntario[]) || [];
}

export async function registrarVoluntario(
  perfil_id: string,
  valores: VoluntarioFormValues
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("voluntarios").upsert({
    perfil_id,
    ...valores,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function actualizarVoluntario(
  id: string,
  valores: Partial<VoluntarioFormValues>
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("voluntarios")
    .update(valores)
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function obtenerMiVoluntario(perfil_id: string): Promise<Voluntario | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from("voluntarios")
    .select("*")
    .eq("perfil_id", perfil_id)
    .single();

  return data as Voluntario | null;
}
