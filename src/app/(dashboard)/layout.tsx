"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import type { PerfilUsuario } from "@/types";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarPerfil() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("perfiles")
        .select("*")
        .eq("usuario_id", user.id)
        .single();

      if (!activo) return;

      if (!data) {
        router.replace("/login");
        return;
      }

      setPerfil(data as PerfilUsuario);
      setCargando(false);
    }

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, [router]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <PageLoader />
      </div>
    );
  }

  if (!perfil) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="hidden lg:flex shrink-0">
        <Sidebar rolUsuario={perfil.rol} />
      </div>

      {menuMovilAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuMovilAbierto(false)}
          />
          <div className="relative z-50 h-full w-72">
            <Sidebar
              rolUsuario={perfil.rol}
              onClose={() => setMenuMovilAbierto(false)}
              mobile
            />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          perfil={perfil}
          onMenuToggle={() => setMenuMovilAbierto((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
