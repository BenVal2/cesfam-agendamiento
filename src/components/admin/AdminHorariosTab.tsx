"use client";

import React, { useState } from "react";
import { Doctor, Slot } from "@/types";
import { DAY_NAMES_SHORT, DAY_NAMES_FULL } from "@/lib/constants";
import { formatTime } from "@/lib/utils";

interface AdminHorariosTabProps {
  doctors: Doctor[];
  slots: Slot[];
  setSlots: React.Dispatch<React.SetStateAction<Slot[]>>;
  setError: (e: string | null) => void;
}

const inputClass =
  "w-full rounded-[var(--radius-md)] border border-input-border bg-input-bg px-3 py-2.5 text-sm text-fg focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-input-ring transition-shadow min-h-[44px]";

export function AdminHorariosTab({
  doctors,
  slots,
  setSlots,
  setError,
}: AdminHorariosTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!doctorId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/horarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          dayOfWeek,
          startTime,
          endTime,
          durationMinutes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear horario");
      }
      const created = await res.json();
      const doctor = doctors.find((d) => d.id === doctorId);
      setSlots((prev) => [
        ...prev,
        {
          ...created,
          doctor: doctor ? { id: doctor.id, name: doctor.name } : undefined,
        },
      ]);
      setShowForm(false);
      setDoctorId("");
      setStartTime("09:00");
      setEndTime("12:00");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar horario");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/horarios?id=${id}`, { method: "DELETE" });
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Error al eliminar horario");
    }
  }

  const groupedByDoctor = doctors.reduce(
    (acc, doctor) => {
      acc[doctor.id] = {
        doctor,
        slots: slots.filter((s) => s.doctorId === doctor.id),
      };
      return acc;
    },
    {} as Record<string, { doctor: Doctor; slots: Slot[] }>
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-fg">Disponibilidad y Franjas Horarias</h2>
          <p className="text-xs text-fg-muted">
            Configura los días y turnos de atención para cada profesional.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-[var(--radius-md)] bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-colors min-h-[44px] cursor-pointer"
        >
          + Nueva franja horaria
        </button>
      </div>

      {showForm && (
        <div className="flex flex-col glass-card rounded-[var(--radius-xl)] p-5 sm:p-6 gap-4 border border-primary/40 shadow-md">
          <h3 className="font-bold text-fg text-base">Crear nueva franja horaria</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="slot-doctor" className="block text-sm font-medium text-fg mb-1.5">
                Profesional médico
              </label>
              <select
                id="slot-doctor"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar médico...</option>
                {doctors
                  .filter((d) => d.active)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="slot-day" className="block text-sm font-medium text-fg mb-1.5">
                Día de la semana
              </label>
              <select
                id="slot-day"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className={inputClass}
              >
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {DAY_NAMES_FULL[d]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="slot-start" className="block text-sm font-medium text-fg mb-1.5">
                Hora de inicio
              </label>
              <input
                id="slot-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="slot-end" className="block text-sm font-medium text-fg mb-1.5">
                Hora de término
              </label>
              <input
                id="slot-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="slot-duration" className="block text-sm font-medium text-fg mb-1.5">
                Duración por cita (minutos)
              </label>
              <input
                id="slot-duration"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={15}
                max={120}
                step={15}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !doctorId}
              className="rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {saving ? "Creando..." : "Guardar franja"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-[var(--radius-md)] border border-card-border px-4 py-2.5 text-sm font-medium text-fg hover:bg-card-hover transition-colors min-h-[44px]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {Object.values(groupedByDoctor).map(({ doctor, slots: doctorSlots }) => (
          <div key={doctor.id} className="glass-card rounded-[var(--radius-xl)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-card-border pb-2">
              <h3 className="font-bold text-fg text-base">{doctor.name}</h3>
              <span className="text-xs text-fg-muted font-medium">
                {doctor.specialty}
              </span>
            </div>

            {doctorSlots.length === 0 ? (
              <p className="text-sm text-fg-muted py-2">
                Sin horarios configurados actualmente.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {doctorSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-2 rounded-[var(--radius-md)] border border-card-border bg-card px-3 py-1.5 text-sm"
                  >
                    <span className="font-semibold text-primary">
                      {DAY_NAMES_SHORT[slot.dayOfWeek]}
                    </span>
                    <span className="text-fg-secondary text-xs">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                    <span className="text-xs text-fg-muted">
                      ({slot.durationMinutes} min)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(slot.id)}
                      className="ml-1 text-danger hover:text-danger-hover transition-colors p-1 rounded hover:bg-danger-soft"
                      aria-label={`Eliminar franja ${DAY_NAMES_SHORT[slot.dayOfWeek]} ${slot.startTime}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
