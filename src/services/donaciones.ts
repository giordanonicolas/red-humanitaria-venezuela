import { createClient } from "@/lib/supabase/client";
import type { Donacion, FiltrosDonaciones } from "@/types";
import type { DonacionFormValues } from "@/validations/donaciones";

export async function obtenerDonaciones(filtros?: FiltrosDonaciones): Promise<Donacion[]> {
  const supabase = createClient();

  let query = supabase
    .from("donaciones")
    .select(`
      *,
      donante:perfiles(id, nombre_completo, alias),
      centro_destino:centros(id, nombre, ciudad)
    `)
    .order("creado_en", { ascending: false });

  if (filtros?.estado) query = query.eq("estado", filtros.estado);
  if (filtros?.categoria) query = query.eq("categoria", filtros.categoria);
  if (filtros?.centro_destino_id)
    query = query.eq("centro_destino_id", filtros.centro_destino_id);

  const { data } = await query;
  return (data as Donacion[]) || [];
}

export async function crearDonacion(
  valores: DonacionFormValues,
  donante_id?: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("donaciones").insert({
    ...valores,
    donante_id: donante_id || null,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function actualizarEstadoDonacion(
  id: string,
  estado: Donacion["estado"]
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("donaciones")
    .update({ estado, actualizado_en: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function actualizarDonacion(
  id: string,
  valores: Partial<DonacionFormValues>
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("donaciones")
    .update({ ...valores, actualizado_en: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}
