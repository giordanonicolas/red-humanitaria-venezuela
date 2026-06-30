export type UserRole =
  | "administrador"
  | "responsable_centro"
  | "voluntario"
  | "donante"
  | "anfitriion";

export type EstadoCentro =
  | "activo"
  | "saturado"
  | "necesita_apoyo"
  | "cerrado_temporalmente";

export type PrioridadInventario = "critica" | "alta" | "media" | "baja";

export type CategoriaInventario =
  | "agua"
  | "alimentos"
  | "medicamentos"
  | "insumos_medicos"
  | "ropa"
  | "calzado"
  | "higiene"
  | "panales"
  | "colchones"
  | "frazadas"
  | "carpas"
  | "linternas"
  | "baterias"
  | "gas"
  | "combustible"
  | "herramientas"
  | "otros";

export type EstadoDonacion =
  | "pendiente"
  | "en_camino"
  | "entregado"
  | "recibido";

export type TipoAlojamiento =
  | "patio"
  | "habitacion"
  | "casa"
  | "garaje"
  | "galpon"
  | "espacio_comunitario"
  | "otro";

export type EstadoAlojamiento = "disponible" | "ocupado" | "no_disponible";

export type TipoSolicitud =
  | "alimentos"
  | "agua"
  | "medicamentos"
  | "ropa"
  | "transporte"
  | "alojamiento"
  | "rescate"
  | "otro";

export type UrgenciaSolicitud = "critica" | "alta" | "media" | "baja";

export type EstadoSolicitud =
  | "pendiente"
  | "en_proceso"
  | "resuelta"
  | "cancelada";

export type TipoAlerta =
  | "inventario_critico"
  | "pedido_urgente"
  | "alojamiento_liberado"
  | "centro_saturado"
  | "redistribucion_sugerida";

export interface PerfilUsuario {
  id: string;
  usuario_id: string;
  nombre_completo: string;
  alias: string | null;
  telefono: string | null;
  telefono_visible: boolean;
  ciudad: string | null;
  rol: UserRole;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Centro {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  estado_region: string;
  responsable_id: string | null;
  contacto_nombre: string;
  contacto_telefono: string;
  capacidad_maxima: number;
  personas_atendidas: number;
  estado: EstadoCentro;
  observaciones: string | null;
  latitud: number | null;
  longitud: number | null;
  ubicacion_url: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  responsable?: PerfilUsuario;
}

export interface ItemInventario {
  id: string;
  centro_id: string;
  categoria: CategoriaInventario;
  nombre_item: string;
  cantidad_disponible: number;
  cantidad_necesaria: number;
  unidad: string;
  prioridad: PrioridadInventario;
  observaciones: string | null;
  fecha_actualizacion: string;
  creado_en: string;
  centro?: Centro;
}

export interface Donacion {
  id: string;
  donante_id: string | null;
  nombre_donante: string;
  categoria: CategoriaInventario;
  descripcion: string;
  cantidad: number;
  unidad: string;
  centro_destino_id: string | null;
  estado: EstadoDonacion;
  observaciones: string | null;
  latitud: number | null;
  longitud: number | null;
  ubicacion_url: string | null;
  creado_en: string;
  actualizado_en: string;
  donante?: PerfilUsuario;
  centro_destino?: Centro;
}

export interface Alojamiento {
  id: string;
  anfitriion_id: string;
  tipo: TipoAlojamiento;
  ciudad: string;
  zona: string | null;
  capacidad_personas: number;
  acepta_ninos: boolean;
  acepta_mascotas: boolean;
  tiene_agua: boolean;
  tiene_electricidad: boolean;
  tiene_bano: boolean;
  observaciones: string | null;
  estado: EstadoAlojamiento;
  latitud: number | null;
  longitud: number | null;
  ubicacion_url: string | null;
  creado_en: string;
  actualizado_en: string;
  anfitriion?: PerfilUsuario;
  familias_asignadas?: FamiliaAlojamiento[];
}

export interface FamiliaAlojamiento {
  id: string;
  nombre_contacto: string;
  cantidad_personas: number;
  tiene_ninos: boolean;
  tiene_mascotas: boolean;
  ciudad_origen: string;
  necesidades_especiales: string | null;
  alojamiento_asignado_id: string | null;
  estado: "buscando" | "asignada" | "alojada";
  creado_en: string;
  alojamiento?: Alojamiento;
}

export interface Voluntario {
  id: string;
  perfil_id: string;
  disponibilidad: "inmediata" | "fines_semana" | "entre_semana" | "flexible";
  tiene_vehiculo: boolean;
  tipo_vehiculo: string | null;
  puede_transportar: boolean;
  puede_ayudar_centro: boolean;
  puede_cocinar: boolean;
  puede_asistir_medicamente: boolean;
  observaciones: string | null;
  activo: boolean;
  creado_en: string;
  perfil?: PerfilUsuario;
}

export interface SolicitudAyuda {
  id: string;
  solicitante_id: string | null;
  nombre_solicitante: string;
  tipo: TipoSolicitud;
  descripcion: string;
  ciudad: string;
  direccion_referencia: string | null;
  urgencia: UrgenciaSolicitud;
  estado: EstadoSolicitud;
  responsable_id: string | null;
  latitud: number | null;
  longitud: number | null;
  ubicacion_url: string | null;
  creado_en: string;
  actualizado_en: string;
  solicitante?: PerfilUsuario;
  responsable?: PerfilUsuario;
}

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  titulo: string;
  descripcion: string;
  centro_id: string | null;
  item_inventario_id: string | null;
  solicitud_id: string | null;
  prioridad: PrioridadInventario;
  resuelta: boolean;
  creado_en: string;
  centro?: Centro;
}

export interface SugerenciaRedistribucion {
  id: string;
  categoria: CategoriaInventario;
  nombre_item: string;
  centro_origen_id: string;
  centro_destino_id: string;
  cantidad_sugerida: number;
  unidad: string;
  estado: "pendiente" | "aceptada" | "rechazada" | "ejecutada";
  creado_en: string;
  centro_origen?: Centro;
  centro_destino?: Centro;
}

export interface EstadisticasDashboard {
  centros_activos: number;
  total_voluntarios: number;
  solicitudes_urgentes: number;
  familias_esperando: number;
  alojamientos_disponibles: number;
  donaciones_recibidas: number;
  donaciones_pendientes: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pagina: number;
  por_pagina: number;
}

export interface FiltrosCentros {
  ciudad?: string;
  estado?: EstadoCentro;
  busqueda?: string;
}

export interface FiltrosInventario {
  centro_id?: string;
  categoria?: CategoriaInventario;
  prioridad?: PrioridadInventario;
  solo_criticos?: boolean;
}

export interface FiltrosDonaciones {
  estado?: EstadoDonacion;
  categoria?: CategoriaInventario;
  centro_destino_id?: string;
}

export interface FiltrosVoluntarios {
  ciudad?: string;
  disponibilidad?: Voluntario["disponibilidad"];
  puede_transportar?: boolean;
  puede_asistir_medicamente?: boolean;
}

export interface FiltrosAlojamientos {
  ciudad?: string;
  estado?: EstadoAlojamiento;
  acepta_ninos?: boolean;
  acepta_mascotas?: boolean;
}

export interface FiltrosSolicitudes {
  tipo?: TipoSolicitud;
  urgencia?: UrgenciaSolicitud;
  estado?: EstadoSolicitud;
  ciudad?: string;
}
