import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type {
  EstadoCentro,
  PrioridadInventario,
  CategoriaInventario,
  EstadoDonacion,
  EstadoAlojamiento,
  TipoSolicitud,
  UrgenciaSolicitud,
  EstadoSolicitud,
  UserRole,
} from "@/types";

export function formatearFecha(fecha: string): string {
  return format(new Date(fecha), "dd/MM/yyyy", { locale: es });
}

export function formatearFechaHora(fecha: string): string {
  return format(new Date(fecha), "dd/MM/yyyy HH:mm", { locale: es });
}

export function formatearTiempoRelativo(fecha: string): string {
  return formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es });
}

export function formatearNumero(numero: number): string {
  return new Intl.NumberFormat("es-VE").format(numero);
}

const etiquetasEstadoCentro: Record<EstadoCentro, string> = {
  activo: "Activo",
  saturado: "Saturado",
  necesita_apoyo: "Necesita apoyo",
  cerrado_temporalmente: "Cerrado temporalmente",
};

export function etiquetaEstadoCentro(estado: EstadoCentro): string {
  return etiquetasEstadoCentro[estado];
}

const coloresEstadoCentro: Record<EstadoCentro, string> = {
  activo: "success",
  saturado: "danger",
  necesita_apoyo: "warning",
  cerrado_temporalmente: "default",
};

export function colorEstadoCentro(estado: EstadoCentro): string {
  return coloresEstadoCentro[estado];
}

const etiquetasPrioridad: Record<PrioridadInventario, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export function etiquetaPrioridad(prioridad: PrioridadInventario): string {
  return etiquetasPrioridad[prioridad];
}

const coloresPrioridad: Record<PrioridadInventario, string> = {
  critica: "danger",
  alta: "warning",
  media: "primary",
  baja: "success",
};

export function colorPrioridad(prioridad: PrioridadInventario): string {
  return coloresPrioridad[prioridad];
}

const etiquetasCategoria: Record<CategoriaInventario, string> = {
  agua: "Agua",
  alimentos: "Alimentos",
  medicamentos: "Medicamentos",
  insumos_medicos: "Insumos médicos",
  ropa: "Ropa",
  calzado: "Calzado",
  higiene: "Higiene",
  panales: "Pañales",
  colchones: "Colchones",
  frazadas: "Frazadas",
  carpas: "Carpas",
  linternas: "Linternas",
  baterias: "Baterías",
  gas: "Gas",
  combustible: "Combustible",
  herramientas: "Herramientas",
  otros: "Otros",
};

export function etiquetaCategoria(categoria: CategoriaInventario): string {
  return etiquetasCategoria[categoria];
}

const etiquetasEstadoDonacion: Record<EstadoDonacion, string> = {
  pendiente: "Pendiente",
  en_camino: "En camino",
  entregado: "Entregado",
  recibido: "Recibido",
};

export function etiquetaEstadoDonacion(estado: EstadoDonacion): string {
  return etiquetasEstadoDonacion[estado];
}

const etiquetasEstadoAlojamiento: Record<EstadoAlojamiento, string> = {
  disponible: "Disponible",
  ocupado: "Ocupado",
  no_disponible: "No disponible",
};

export function etiquetaEstadoAlojamiento(estado: EstadoAlojamiento): string {
  return etiquetasEstadoAlojamiento[estado];
}

const etiquetasTipoSolicitud: Record<TipoSolicitud, string> = {
  alimentos: "Alimentos",
  agua: "Agua",
  medicamentos: "Medicamentos",
  ropa: "Ropa",
  transporte: "Transporte",
  alojamiento: "Alojamiento",
  rescate: "Rescate",
  otro: "Otro",
};

export function etiquetaTipoSolicitud(tipo: TipoSolicitud): string {
  return etiquetasTipoSolicitud[tipo];
}

const etiquetasUrgencia: Record<UrgenciaSolicitud, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export function etiquetaUrgencia(urgencia: UrgenciaSolicitud): string {
  return etiquetasUrgencia[urgencia];
}

const etiquetasEstadoSolicitud: Record<EstadoSolicitud, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  resuelta: "Resuelta",
  cancelada: "Cancelada",
};

export function etiquetaEstadoSolicitud(estado: EstadoSolicitud): string {
  return etiquetasEstadoSolicitud[estado];
}

const etiquetasRol: Record<UserRole, string> = {
  administrador: "Administrador",
  responsable_centro: "Responsable de centro",
  voluntario: "Voluntario",
  donante: "Donante",
  anfitriion: "Anfitrión",
};

export function etiquetaRol(rol: UserRole): string {
  return etiquetasRol[rol];
}

export function calcularPorcentajeInventario(
  disponible: number,
  necesario: number
): number {
  if (necesario === 0) return 100;
  return Math.min(Math.round((disponible / necesario) * 100), 100);
}

export function esCritico(disponible: number, necesario: number): boolean {
  if (necesario === 0) return false;
  return disponible / necesario < 0.2;
}
