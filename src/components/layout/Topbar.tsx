"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, User, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { etiquetaRol } from "@/utils/formatters";
import type { PerfilUsuario } from "@/types";

interface TopbarProps {
  perfil: PerfilUsuario;
  onMenuToggle: () => void;
}

export function Topbar({ perfil, onMenuToggle }: TopbarProps) {
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);

  async function cerrarSesion() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const nombreMostrado = perfil.alias || perfil.nombre_completo;

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="hidden lg:block" />

      <div className="relative">
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary-600" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900 leading-tight">
              {nombreMostrado}
            </p>
            <p className="text-xs text-gray-500">{etiquetaRol(perfil.rol)}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
        </button>

        {menuAbierto && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuAbierto(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden">
              <button
                onClick={cerrarSesion}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
