"use client";

import { MapPin, Phone, Users, Edit, Trash2, ExternalLink, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  etiquetaEstadoCentro,
  formatearNumero,
  calcularPorcentajeInventario,
} from "@/utils/formatters";
import type { Centro } from "@/types";

const colorEstado = {
  activo: "success",
  saturado: "danger",
  necesita_apoyo: "warning",
  cerrado_temporalmente: "default",
} as const;

interface TarjetaCentroProps {
  centro: Centro;
  onEditar?: (centro: Centro) => void;
  onEliminar?: (centro: Centro) => void;
  puedeEditar?: boolean;
}

function generarMensajeWhatsApp(centro: Centro): string {
  const porcentaje = calcularPorcentajeInventario(centro.personas_atendidas, centro.capacidad_maxima);
  const lineas = [
    `🏥 *Centro de ayuda: ${centro.nombre}*`,
    ``,
    `📍 *Ubicación:* ${centro.ciudad}, ${centro.estado_region}`,
    `📊 *Estado:* ${etiquetaEstadoCentro(centro.estado)}`,
    `👥 *Ocupación:* ${centro.personas_atendidas}/${centro.capacidad_maxima} personas (${porcentaje}%)`,
  ];
  if (centro.contacto_nombre) lineas.push(`📞 *Contacto:* ${centro.contacto_nombre}`);
  if (centro.ubicacion_url) lineas.push(`🗺️ *Cómo llegar:* ${centro.ubicacion_url}`);
  lineas.push(``, `Compartido desde Red Humanitaria`);
  return encodeURIComponent(lineas.join("\n"));
}

export function TarjetaCentro({
  centro,
  onEditar,
  onEliminar,
  puedeEditar = false,
}: TarjetaCentroProps) {
  const porcentajeOcupacion = calcularPorcentajeInventario(
    centro.personas_atendidas,
    centro.capacidad_maxima
  );

  return (
    <div className={`bg-white rounded-2xl border shadow-sm flex flex-col gap-4 overflow-hidden ${
      centro.estado === "saturado"
        ? "border-red-200"
        : centro.estado === "necesita_apoyo"
        ? "border-orange-200"
        : "border-gray-100"
    }`}>
      {centro.estado === "saturado" && (
        <div className="px-5 py-2 bg-red-600 text-white text-xs font-semibold">
          ⚠️ Centro saturado — capacidad máxima alcanzada
        </div>
      )}
      {centro.estado === "necesita_apoyo" && (
        <div className="px-5 py-2 bg-orange-500 text-white text-xs font-semibold">
          ⚡ Necesita apoyo
        </div>
      )}

      <div className="px-5 pt-4 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{centro.nombre}</h3>
            <div className="flex items-center gap-1 mt-1 text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="text-sm truncate">{centro.ciudad}, {centro.estado_region}</span>
            </div>
          </div>
          <Badge variant={colorEstado[centro.estado]} className="shrink-0">
            {etiquetaEstadoCentro(centro.estado)}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users className="h-4 w-4" />
              <span>Ocupación</span>
            </div>
            <span className="font-medium text-gray-700">
              {formatearNumero(centro.personas_atendidas)} / {formatearNumero(centro.capacidad_maxima)}
            </span>
          </div>
          <ProgressBar value={centro.personas_atendidas} max={centro.capacidad_maxima || 1} showLabel />
        </div>

        {centro.contacto_telefono && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{centro.contacto_nombre} — {centro.contacto_telefono}</span>
          </div>
        )}

        {centro.observaciones && (
          <p className="text-sm text-gray-500 line-clamp-2">{centro.observaciones}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {centro.ubicacion_url && (
            <a
              href={centro.ubicacion_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              Cómo llegar
            </a>
          )}
          <a
            href={`https://wa.me/?text=${generarMensajeWhatsApp(centro)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <Share2 className="h-3.5 w-3.5 shrink-0" />
            Compartir
          </a>
        </div>
      </div>

      {puedeEditar && (
        <div className="flex gap-2 px-5 pb-4 pt-1 border-t border-gray-50">
          <Button variant="ghost" size="sm" onClick={() => onEditar?.(centro)} className="flex-1">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEliminar?.(centro)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
