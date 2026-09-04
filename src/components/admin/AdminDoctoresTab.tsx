"use client";

import React, { useState } from "react";
import { Doctor } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface AdminDoctoresTabProps {
  doctors: Doctor[];
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  setError: (e: string | null) => void;
}

const inputClass =
  "w-full rounded-[var(--radius-md)] border border-input-border bg-input-bg px-3.5 py-2.5 text-sm text-fg focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-input-ring transition-shadow min-h-[44px]";

export function AdminDoctoresTab({
  doctors,
  setDoctors,
  setError,
}: AdminDoctoresTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("Medicina General");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch("/api/admin/doctores", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, name, specialty }),
        });
        if (!res.ok) throw new Error("Error al actualizar médico");
        const updated = await res.json();
        setDoctors((prev) =>
          prev.map((d) => (d.id === editingId ? { ...d, ...updated } : d))
        );
      } else {
        const res = await fetch("/api/admin/doctores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, specialty }),
        });
        if (!res.ok) throw new Error("Error al crear médico");
        const created = await res.json();
        setDoctors((prev) => [
          ...prev,
          { ...created, availableSlots: [], active: true },
        ]);
      }
      resetForm();
    } catch {
      setError("Error al guardar información del médico");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      if (active) {
        await fetch("/api/admin/doctores", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, active: true }),
        });
        setDoctors((prev) =>
          prev.map((d) => (d.id === id ? { ...d, active: true } : d))
        );
      } else {
        await fetch(`/api/admin/doctores?id=${id}`, { method: "DELETE" });
        setDoctors((prev) =>
          prev.map((d) => (d.id === id ? { ...d, active: false } : d))
        );
      }
    } catch {
      setError("Error al actualizar el estado del médico");
    }
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setSpecialty("Medicina General");
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-fg">Equipo Médico</h2>
          <p className="text-xs text-fg-muted">
            Gestiona los profesionales disponibles para la atención de pacientes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-[var(--radius-md)] bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-colors min-h-[44px] cursor-pointer"
        >
          + Agregar médico
        </button>
      </div>

      {showForm && (
        <div className="flex flex-col glass-card rounded-[var(--radius-xl)] p-5 sm:p-6 gap-4 border border-primary/40 shadow-md">
          <h3 className="font-bold text-fg text-base">
            {editingId ? "Editar información del médico" : "Registrar nuevo médico"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="doc-name" className="block text-sm font-medium text-fg mb-1.5">
                Nombre completo
              </label>
              <input
                id="doc-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Ej. Dr. Andrés Soto"
              />
            </div>
            <div>
              <label htmlFor="doc-specialty" className="block text-sm font-medium text-fg mb-1.5">
                Especialidad
              </label>
              <input
                id="doc-specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className={inputClass}
                placeholder="Ej. Medicina General, Pediatría"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {saving ? "Guardando..." : editingId ? "Actualizar cambios" : "Guardar médico"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-[var(--radius-md)] border border-card-border px-4 py-2.5 text-sm font-medium text-fg hover:bg-card-hover transition-colors min-h-[44px]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className={`glass-card rounded-[var(--radius-xl)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              !doctor.active ? "opacity-60 bg-card/40" : "hover:border-primary/40"
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <p className="font-bold text-fg text-base">{doctor.name}</p>
                <Badge variant={doctor.active ? "success" : "neutral"} size="sm">
                  {doctor.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="text-sm text-fg-secondary mt-0.5">{doctor.specialty}</p>
              <p className="text-xs text-fg-muted mt-1.5 font-medium">
                {doctor.availableSlots?.length || 0} franjas horarias configuradas
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingId(doctor.id);
                  setName(doctor.name);
                  setSpecialty(doctor.specialty);
                  setShowForm(true);
                }}
                className="rounded-[var(--radius-md)] border border-card-border px-3.5 py-2 text-xs font-semibold text-fg hover:bg-card-hover transition-colors min-h-[44px]"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleToggle(doctor.id, !doctor.active)}
                className={`rounded-[var(--radius-md)] border px-3.5 py-2 text-xs font-semibold transition-colors min-h-[44px] ${
                  doctor.active
                    ? "border-danger/30 text-danger hover:bg-danger hover:text-white"
                    : "border-secondary/40 text-secondary hover:bg-secondary hover:text-white"
                }`}
              >
                {doctor.active ? "Desactivar" : "Reactivar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
