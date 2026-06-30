"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Package,
  Gift,
  Users,
  Home,
  HeartHandshake,
  Bell,
  X,
  Heart,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Panel principal",
    icon: LayoutDashboard,
    roles: ["administrador", "responsable_centro", "voluntario", "donante", "anfitriion"],
  },
  {
    href: "/centros",
    label: "Centros",
    icon: Building2,
    roles: ["administrador", "responsable_centro", "voluntario"],
  },
  {
    href: "/inventario",
    label: "Inventario",
    icon: Package,
    roles: ["administrador", "responsable_centro"],
  },
  {
    href: "/donaciones",
    label: "Donaciones",
    icon: Gift,
    roles: ["administrador", "responsable_centro", "donante"],
  },
  {
    href: "/voluntarios",
    label: "Voluntarios",
    icon: Users,
    roles: ["administrador", "responsable_centro", "voluntario"],
  },
  {
    href: "/alojamientos",
    label: "Alojamientos",
    icon: Home,
    roles: ["administrador", "responsable_centro", "voluntario", "anfitriion"],
  },
  {
    href: "/solicitudes",
    label: "Solicitudes",
    icon: HeartHandshake,
    roles: ["administrador", "responsable_centro", "voluntario"],
  },
  {
    href: "/alertas",
    label: "Alertas",
    icon: Bell,
    roles: ["administrador", "responsable_centro"],
  },
];

interface SidebarProps {
  rolUsuario: UserRole;
  onClose?: () => void;
  mobile?: boolean;
}

export function Sidebar({ rolUsuario, onClose, mobile }: SidebarProps) {
  const pathname = usePathname();

  const itemsVisibles = navItems.filter((item) =>
    item.roles.includes(rolUsuario)
  );

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-100",
        mobile ? "w-full" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600 rounded-xl">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">Red Humanitaria</p>
            <p className="text-xs text-gray-400">Gestión de ayuda</p>
          </div>
        </div>
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {itemsVisibles.map((item) => {
          const activo =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                activo
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  activo ? "text-primary-600" : "text-gray-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
