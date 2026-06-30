"use client";

import { useState } from "react";
import { MapPin, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UbicacionCapturada {
  latitud: number;
  longitud: number;
  ubicacion_url: string;
}

interface SelectorUbicacionProps {
  value?: UbicacionCapturada | null;
  onChange: (val: UbicacionCapturada | null) => void;
}

export function SelectorUbicacion({ value, onChange }: SelectorUbicacionProps) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function capturarUbicacion() {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización. Podés escribir una referencia manual.");
      return;
    }
    setCargando(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onChange({
          latitud: lat,
          longitud: lng,
          ubicacion_url: `https://www.google.com/maps?q=${lat},${lng}`,
        });
        setCargando(false);
      },
      () => {
        setError("No pudimos acceder a tu ubicación. Podés escribir una referencia manual.");
        setCargando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function limpiar() {
    onChange(null);
    setError(null);
  }

  return (
    <div className="space-y-2">
      {!value ? (
        <Button
          type="button"
          variant="secondary"
          onClick={capturarUbicacion}
          loading={cargando}
          className="w-full sm:w-auto"
        >
          <Navigation className="h-4 w-4" />
          Compartir ubicación
        </Button>
      ) : (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <MapPin className="h-4 w-4 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">Ubicación compartida correctamente</p>
            <p className="text-xs text-green-600 truncate">
              {value.latitud.toFixed(6)}, {value.longitud.toFixed(6)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={value.ubicacion_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-green-700 hover:text-green-900 underline"
            >
              Ver en mapa
            </a>
            <button
              type="button"
              onClick={limpiar}
              className="p-1 rounded-lg text-green-600 hover:text-green-900 hover:bg-green-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
    </div>
  );
}
