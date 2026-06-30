"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Search } from "lucide-react";
import {
  obtenerCentros,
  crearCentro,
  actualizarCentro,
  desactivarCentro,
} from "@/services/centros";
import { TarjetaCentro } from "@/components/centros/TarjetaCentro";
import { FormCentro } from "@/components/centros/FormCentro";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import type { Centro, EstadoCentro } from "@/types";
import type { CentroFormValues } from "@/validations/centros";

const opcionesFiltroEstado = [
  { value: "", label: "Todos los estados" },
  { value: "activo", label: "Activo" },
  { value: "saturado", label: "Saturado" },
  { value: "necesita_apoyo", label: "Necesita apoyo" },
  { value: "cerrado_temporalmente", label: "Cerrado temporalmente" },
];

export default function CentrosPage() {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [centroEditando, setCentroEditando] = useState<Centro | null>(null);
  const [centroEliminando, setCentroEliminando] = useState<Centro | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [rolUsuario, setRolUsuario] = useState<string>("");
  const [errorForm, setErrorForm] = useState<string | null>(null);

  useEffect(() => {
    cargarRolYCentros();
  }, []);

  async function cargarRolYCentros() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("usuario_id", user.id)
        .single();
      if (perfil) setRolUsuario(perfil.rol);
    }

    await recargar();
  }

  async function recargar() {
    setCargando(true);
    const datos = await obtenerCentros();
    setCentros(datos);
    setCargando(false);
  }

  const centrosFiltrados = centros.filter((c) => {
    const coincideBusqueda =
      !busqueda ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.ciudad.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = !filtroEstado || c.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  function abrirCrear() {
    setCentroEditando(null);
    setErrorForm(null);
    setModalAbierto(true);
  }

  function abrirEditar(centro: Centro) {
    setCentroEditando(centro);
    setErrorForm(null);
    setModalAbierto(true);
  }

  async function handleSubmit(valores: CentroFormValues) {
    setErrorForm(null);
    let resultado;

    if (centroEditando) {
      resultado = await actualizarCentro(centroEditando.id, valores);
    } else {
      resultado = await crearCentro(valores);
    }

    if (resultado.error) {
      setErrorForm("Error al guardar. Intentá de nuevo.");
      return;
    }

    setModalAbierto(false);
    await recargar();
  }

  async function handleEliminar() {
    if (!centroEliminando) return;
    setEliminando(true);
    await desactivarCentro(centroEliminando.id);
    setEliminando(false);
    setCentroEliminando(null);
    await recargar();
  }

  const puedeEditar = ["administrador", "responsable_centro"].includes(rolUsuario);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centros de ayuda</h1>
          <p className="text-gray-500 mt-1">
            {centros.length} centro{centros.length !== 1 ? "s" : ""} registrado
            {centros.length !== 1 ? "s" : ""}
          </p>
        </div>
        {puedeEditar && (
          <Button onClick={abrirCrear}>
            <Plus className="h-4 w-4" />
            Nuevo centro
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o ciudad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="sm:w-52">
          <Select
            options={opcionesFiltroEstado}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          />
        </div>
      </div>

      {cargando ? (
        <PageLoader />
      ) : centrosFiltrados.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Sin centros"
          description={
            busqueda || filtroEstado
              ? "No encontramos centros con esos filtros."
              : "Todavía no hay centros registrados."
          }
          action={
            puedeEditar
              ? { label: "Registrar centro", onClick: abrirCrear }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {centrosFiltrados.map((centro) => (
            <TarjetaCentro
              key={centro.id}
              centro={centro}
              puedeEditar={puedeEditar}
              onEditar={abrirEditar}
              onEliminar={setCentroEliminando}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={centroEditando ? "Editar centro" : "Nuevo centro de ayuda"}
        size="lg"
      >
        {errorForm && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{errorForm}</p>
          </div>
        )}
        <FormCentro
          centroExistente={centroEditando || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalAbierto(false)}
        />
      </Modal>

      <ConfirmModal
        open={!!centroEliminando}
        onClose={() => setCentroEliminando(null)}
        onConfirm={handleEliminar}
        title="Desactivar centro"
        description={`¿Confirmás que querés desactivar "${centroEliminando?.nombre}"? Podrá ser reactivado en el futuro.`}
        confirmLabel="Desactivar"
        loading={eliminando}
      />
    </div>
  );
}
