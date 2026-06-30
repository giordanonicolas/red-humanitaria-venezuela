import { createClient } from "@/lib/supabase/server";
import type { UserRole, PerfilUsuario } from "@/types";

export async function obtenerUsuarioActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function obtenerPerfilActual(): Promise<PerfilUsuario | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("perfiles")
    .select("*")
    .eq("usuario_id", user.id)
    .single();

  return data as PerfilUsuario | null;
}

export async function verificarRol(rolesPermitidos: UserRole[]) {
  const perfil = await obtenerPerfilActual();
  if (!perfil) return false;
  return rolesPermitidos.includes(perfil.rol);
}

export const ROLES_ADMIN = ["administrador"] as UserRole[];
export const ROLES_GESTION = [
  "administrador",
  "responsable_centro",
] as UserRole[];
export const ROLES_TODOS = [
  "administrador",
  "responsable_centro",
  "voluntario",
  "donante",
  "anfitriion",
] as UserRole[];
