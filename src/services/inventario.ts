import { createClient } from "@/lib/supabase/client";
import type { ItemInventario, FiltrosInventario } from "@/types";
import type { InventarioFormValues } from "@/validations/inventario";

export async function obtenerInventario(filtros?: FiltrosInventario): Promise<ItemInventario[]> {
  const supabase = createClient();

  let query = supabase
    .from("inventario")
    .select("*, centro:centros(id, nombre, ciudad)")
    .order("prioridad", { ascending: true })
    .order("nombre_item");

  if (filtros?.centro_id) {
    query = query.eq("centro_id", filtros.centro_id);
  }
  if (filtros?.categoria) {
    query = query.eq("categoria", filtros.categoria);
  }
  if (filtros?.prioridad) {
    query = query.eq("prioridad", filtros.prioridad);
  }
  if (filtros?.solo_criticos) {
    query = query.filter(
      "cantidad_disponible",
      "lt",
      "cantidad_necesaria * 0.2"
    );
  }

  const { data } = await query;
  return (data as ItemInventario[]) || [];
}

export async function obtenerInventarioCritico(): Promise<ItemInventario[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("inventario")
    .select("*, centro:centros(id, nombre, ciudad)")
    .order("prioridad");

  const items = (data as ItemInventario[]) || [];
  return items.filter(
    (item) =>
      item.cantidad_necesaria > 0 &&
      item.cantidad_disponible / item.cantidad_necesaria < 0.2
  );
}

export async function crearItemInventario(
  valores: InventarioFormValues
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("inventario").insert({
    ...valores,
    fecha_actualizacion: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function actualizarItemInventario(
  id: string,
  valores: Partial<InventarioFormValues>
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { centro_id: _omit, ...camposActualizables } = valores;

  const { error } = await supabase
    .from("inventario")
    .update({ ...camposActualizables, fecha_actualizacion: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function eliminarItemInventario(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.from("inventario").delete().eq("id", id)
  if (error) return { error: error.message };
  return { error: null };
}
