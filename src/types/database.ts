export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string;
          usuario_id: string;
          nombre_completo: string;
          alias: string | null;
          telefono: string | null;
          telefono_visible: boolean;
          ciudad: string | null;
          rol: string;
          activo: boolean;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nombre_completo: string;
          alias?: string | null;
          telefono?: string | null;
          telefono_visible?: boolean;
          ciudad?: string | null;
          rol?: string;
          activo?: boolean;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          nombre_completo?: string;
          alias?: string | null;
          telefono?: string | null;
          telefono_visible?: boolean;
          ciudad?: string | null;
          rol?: string;
          activo?: boolean;
          actualizado_en?: string;
        };
        Relationships: [];
      };
      centros: {
        Row: {
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
          estado: string;
          observaciones: string | null;
          latitud: number | null;
          longitud: number | null;
          ubicacion_url: string | null;
          activo: boolean;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          direccion: string;
          ciudad: string;
          estado_region: string;
          responsable_id?: string | null;
          contacto_nombre: string;
          contacto_telefono: string;
          capacidad_maxima: number;
          personas_atendidas?: number;
          estado?: string;
          observaciones?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          ubicacion_url?: string | null;
          activo?: boolean;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          nombre?: string;
          direccion?: string;
          ciudad?: string;
          estado_region?: string;
          responsable_id?: string | null;
          contacto_nombre?: string;
          contacto_telefono?: string;
          capacidad_maxima?: number;
          personas_atendidas?: number;
          estado?: string;
          observaciones?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          ubicacion_url?: string | null;
          activo?: boolean;
          actualizado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "centros_responsable_id_fkey";
            columns: ["responsable_id"];
            isOneToOne: false;
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          }
        ];
      };
      inventario: {
        Row: {
          id: string;
          centro_id: string;
          categoria: string;
          nombre_item: string;
          cantidad_disponible: number;
          cantidad_necesaria: number;
          unidad: string;
          prioridad: string;
          observaciones: string | null;
          fecha_actualizacion: string;
          creado_en: string;
        };
        Insert: {
          id?: string;
          centro_id: string;
          categoria: string;
          nombre_item: string;
          cantidad_disponible?: number;
          cantidad_necesaria?: number;
          unidad: string;
          prioridad?: string;
          observaciones?: string | null;
          fecha_actualizacion?: string;
          creado_en?: string;
        };
        Update: {
          categoria?: string;
          nombre_item?: string;
          cantidad_disponible?: number;
          cantidad_necesaria?: number;
          unidad?: string;
          prioridad?: string;
          observaciones?: string | null;
          fecha_actualizacion?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventario_centro_id_fkey";
            columns: ["centro_id"];
            isOneToOne: false;
            referencedRelation: "centros";
            referencedColumns: ["id"];
          }
        ];
      };
      donaciones: {
        Row: {
          id: string;
          donante_id: string | null;
          nombre_donante: string;
          categoria: string;
          descripcion: string;
          cantidad: number;
          unidad: string;
          centro_destino_id: string | null;
          estado: string;
          observaciones: string | null;
          latitud: number | null;
          longitud: number | null;
          ubicacion_url: string | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          donante_id?: string | null;
          nombre_donante: string;
          categoria: string;
          descripcion: string;
          cantidad: number;
          unidad: string;
          centro_destino_id?: string | null;
          estado?: string;
          observaciones?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          ubicacion_url?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          nombre_donante?: string;
          categoria?: string;
          descripcion?: string;
          cantidad?: number;
          unidad?: string;
          centro_destino_id?: string | null;
          estado?: string;
          observaciones?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          ubicacion_url?: string | null;
          actualizado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "donaciones_donante_id_fkey";
            columns: ["donante_id"];
            isOneToOne: false;
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "donaciones_centro_destino_id_fkey";
            columns: ["centro_destino_id"];
            isOneToOne: false;
            referencedRelation: "centros";
            referencedColumns: ["id"];
          }
        ];
      };
      alojamientos: {
        Row: {
          id: string;
          anfitriion_id: string;
          tipo: string;
          ciudad: string;
          zona: string | null;
          capacidad_personas: number;
          acepta_ninos: boolean;
          acepta_mascotas: boolean;
          tiene_agua: boolean;
          tiene_electricidad: boolean;
          tiene_bano: boolean;
          observaciones: string | null;
          estado: string;
          latitud: number | null;
          longitud: number | null;
          ubicacion_url: string | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          anfitriion_id: string;
          tipo: string;
          ciudad: string;
          zona?: string | null;
          capacidad_personas: number;
          acepta_ninos?: boolean;
          acepta_mascotas?: boolean;
          tiene_agua?: boolean;
          tiene_electricidad?: boolean;
          tiene_bano?: boolean;
          observaciones?: string | null;
          estado?: string;
          latitud?: number | null;
          longitud?: number | null;
          ubicacion_url?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          tipo?: string;
          ciudad?: string;
          zona?: string | null;
          capacidad_personas?: number;
          acepta_ninos?: boolean;
          acepta_mascotas?: boolean;
          tiene_agua?: boolean;
          tiene_electricidad?: boolean;
          tiene_bano?: boolean;
          observaciones?: string | null;
          estado?: string;
          latitud?: number | null;
          longitud?: number | null;
          ubicacion_url?: string | null;
          actualizado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alojamientos_anfitriion_id_fkey";
            columns: ["anfitriion_id"];
            isOneToOne: false;
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          }
        ];
      };
      familias_alojamiento: {
        Row: {
          id: string;
          nombre_contacto: string;
          cantidad_personas: number;
          tiene_ninos: boolean;
          tiene_mascotas: boolean;
          ciudad_origen: string;
          necesidades_especiales: string | null;
          alojamiento_asignado_id: string | null;
          estado: string;
          creado_en: string;
        };
        Insert: {
          id?: string;
          nombre_contacto: string;
          cantidad_personas: number;
          tiene_ninos?: boolean;
          tiene_mascotas?: boolean;
          ciudad_origen: string;
          necesidades_especiales?: string | null;
          alojamiento_asignado_id?: string | null;
          estado?: string;
          creado_en?: string;
        };
        Update: {
          alojamiento_asignado_id?: string | null;
          estado?: string;
        };
        Relationships: [
          {
            foreignKeyName: "familias_alojamiento_alojamiento_asignado_id_fkey";
            columns: ["alojamiento_asignado_id"];
            isOneToOne: false;
            referencedRelation: "alojamientos";
            referencedColumns: ["id"];
          }
        ];
      };
      voluntarios: {
        Row: {
          id: string;
          perfil_id: string;
          disponibilidad: string;
          tiene_vehiculo: boolean;
          tipo_vehiculo: string | null;
          puede_transportar: boolean;
          puede_ayudar_centro: boolean;
          puede_cocinar: boolean;
          puede_asistir_medicamente: boolean;
          observaciones: string | null;
          activo: boolean;
          creado_en: string;
        };
        Insert: {
          id?: string;
          perfil_id: string;
          disponibilidad?: string;
          tiene_vehiculo?: boolean;
          tipo_vehiculo?: string | null;
          puede_transportar?: boolean;
          puede_ayudar_centro?: boolean;
          puede_cocinar?: boolean;
          puede_asistir_medicamente?: boolean;
          observaciones?: string | null;
          activo?: boolean;
          creado_en?: string;
        };
        Update: {
          disponibilidad?: string;
          tiene_vehiculo?: boolean;
          tipo_vehiculo?: string | null;
          puede_transportar?: boolean;
          puede_ayudar_centro?: boolean;
          puede_cocinar?: boolean;
          puede_asistir_medicamente?: boolean;
          observaciones?: string | null;
          activo?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "voluntarios_perfil_id_fkey";
            columns: ["perfil_id"];
            isOneToOne: false;
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          }
        ];
      };
      solicitudes_ayuda: {
        Row: {
          id: string;
          solicitante_id: string | null;
          nombre_solicitante: string;
          tipo: string;
          descripcion: string;
          ciudad: string;
          direccion_referencia: string | null;
          urgencia: string;
          estado: string;
          responsable_id: string | null;
          latitud: number | null;
          longitud: number | null;
          ubicacion_url: string | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          solicitante_id?: string | null;
          nombre_solicitante: string;
          tipo: string;
          descripcion: string;
          ciudad: string;
          direccion_referencia?: string | null;
          urgencia?: string;
          estado?: string;
          responsable_id?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          ubicacion_url?: string | null;
          creado_en?: string;
          actualizado_en?: string;
        };
        Update: {
          nombre_solicitante?: string;
          tipo?: string;
          descripcion?: string;
          ciudad?: string;
          direccion_referencia?: string | null;
          urgencia?: string;
          estado?: string;
          responsable_id?: string | null;
          latitud?: number | null;
          longitud?: number | null;
          ubicacion_url?: string | null;
          actualizado_en?: string;
        };
        Relationships: [
          {
            foreignKeyName: "solicitudes_ayuda_solicitante_id_fkey";
            columns: ["solicitante_id"];
            isOneToOne: false;
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "solicitudes_ayuda_responsable_id_fkey";
            columns: ["responsable_id"];
            isOneToOne: false;
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          }
        ];
      };
      alertas: {
        Row: {
          id: string;
          tipo: string;
          titulo: string;
          descripcion: string;
          centro_id: string | null;
          item_inventario_id: string | null;
          solicitud_id: string | null;
          prioridad: string;
          resuelta: boolean;
          creado_en: string;
        };
        Insert: {
          id?: string;
          tipo: string;
          titulo: string;
          descripcion: string;
          centro_id?: string | null;
          item_inventario_id?: string | null;
          solicitud_id?: string | null;
          prioridad?: string;
          resuelta?: boolean;
          creado_en?: string;
        };
        Update: {
          resuelta?: boolean;
          titulo?: string;
          descripcion?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alertas_centro_id_fkey";
            columns: ["centro_id"];
            isOneToOne: false;
            referencedRelation: "centros";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alertas_item_inventario_id_fkey";
            columns: ["item_inventario_id"];
            isOneToOne: false;
            referencedRelation: "inventario";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alertas_solicitud_id_fkey";
            columns: ["solicitud_id"];
            isOneToOne: false;
            referencedRelation: "solicitudes_ayuda";
            referencedColumns: ["id"];
          }
        ];
      };
      sugerencias_redistribucion: {
        Row: {
          id: string;
          categoria: string;
          nombre_item: string;
          centro_origen_id: string;
          centro_destino_id: string;
          cantidad_sugerida: number;
          unidad: string;
          estado: string;
          creado_en: string;
        };
        Insert: {
          id?: string;
          categoria: string;
          nombre_item: string;
          centro_origen_id: string;
          centro_destino_id: string;
          cantidad_sugerida: number;
          unidad: string;
          estado?: string;
          creado_en?: string;
        };
        Update: {
          estado?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sugerencias_redistribucion_centro_origen_id_fkey";
            columns: ["centro_origen_id"];
            isOneToOne: false;
            referencedRelation: "centros";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sugerencias_redistribucion_centro_destino_id_fkey";
            columns: ["centro_destino_id"];
            isOneToOne: false;
            referencedRelation: "centros";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
