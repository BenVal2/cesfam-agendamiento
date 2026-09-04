"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "@/components/Loading";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { Calendar } from "@/components/booking/Calendar";
import { Alert } from "@/components/ui/Alert";
import { Doctor } from "@/types";
import { DAY_NAMES_SHORT } from "@/lib/constants";
import { formatChileanDate, formatTime } from "@/lib/utils";

export default function AgendarContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/doctores")
        .then((r) => r.json())
        .then(setDoctors)
        .catch(() => setError("Error al cargar doctores"));
    }
  }, [status]);

  const availableDays = useCallback(() => {
    if (!selectedDoctor?.availableSlots) return new Set<number>();
    const days = new Set<number>();
    for (const slot of selectedDoctor.availableSlots) {
      days.add(slot.dayOfWeek);
    }
    return days;
  }, [selectedDoctor])();

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    const dateStr = selectedDate.toISOString().split("T")[0];
    let isCancelled = false;

    fetch(`/api/horas-disponibles?doctorId=${selectedDoctor.id}&date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isCancelled) {
          setAvailableTimes(data.availableTimes || []);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setAvailableTimes([]);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedDoctor, selectedDate]);

  async function handleConfirm() {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    setLoading(true);
    setError(null);
    const dateStr = selectedDate.toISOString().split("T")[0];

    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          date: dateStr,
          time: selectedTime,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear la cita");
      }
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <Loading label="Cargando tu sesión..." />;
  }
  if (!session) return null;

  if (success) {
    return (
      <div id="booking-success" className="flex max-w-md mx-auto flex-col gap-6 py-10 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto ring-4 ring-success-bg/40">
          <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-fg">¡Cita agendada con éxito!</h1>
          <p className="text-sm text-fg-secondary">
            Tu hora médica ha sido confirmada en el sistema.
          </p>
        </div>

        <dl className="flex flex-col glass-card rounded-[var(--radius-xl)] p-6 gap-3 text-left">
          <SummaryRow label="Médico" value={selectedDoctor?.name || ""} />
          <SummaryRow label="Especialidad" value={selectedDoctor?.specialty || ""} />
          <SummaryRow label="Fecha" value={selectedDate ? formatChileanDate(selectedDate) : ""} />
          <SummaryRow label="Hora" value={selectedTime ? formatTime(selectedTime) : ""} />
          <SummaryRow label="Paciente" value={`${session.user?.name} (${session.user?.email})`} />
        </dl>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/mis-citas"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover hover:shadow-md transition-all min-h-[48px]"
          >
            Ver mis citas
          </Link>
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setSelectedDoctor(null);
              setSelectedDate(null);
              setSelectedTime(null);
            }}
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-card-border px-6 py-3 text-sm font-medium text-fg hover:bg-card-hover transition-colors min-h-[48px]"
          >
            Agendar otra hora
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="booking-container" className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-fg mb-1">Agendar hora médica</h1>
        <p className="text-fg-secondary text-sm sm:text-base">
          Selecciona un profesional de la salud, fecha y hora de atención.
        </p>
      </header>

      <StepIndicator current={step} total={3} />

      {error && (
        <Alert type="danger" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {step === 1 && (
        <section aria-labelledby="step-doctor-title">
          <h2 id="step-doctor-title" className="text-lg font-semibold text-fg mb-4">
            Paso 1: Selecciona tu médico
          </h2>

          {doctors.length === 0 ? (
            <div className="text-center py-12 text-fg-muted">
              Cargando profesionales disponibles...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map((doctor) => {
                const days = new Set(doctor.availableSlots?.map((s) => s.dayOfWeek) || []);
                const dayList = [1, 2, 3, 4, 5]
                  .filter((d) => days.has(d))
                  .map((d) => DAY_NAMES_SHORT[d])
                  .join(", ");

                return (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setStep(2);
                    }}
                    className="glass-card group text-left rounded-[var(--radius-xl)] p-5 hover:border-primary hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-base font-bold text-white shadow-sm">
                        {(() => {
                          const parts = doctor.name
                            .split(" ")
                            .filter((w) => !/^(Dr|Dra|Doctor|Doctora)\.?$/i.test(w));
                          const initials = parts
                            .slice(0, 2)
                            .map((w) => w[0]?.toUpperCase() || "")
                            .join("");
                          return initials || "MD";
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-fg group-hover:text-primary transition-colors text-base">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-fg-secondary">{doctor.specialty}</p>
                        <p className="text-xs text-primary mt-2 inline-flex items-center gap-1.5 font-medium">
                          <span className="h-2 w-2 rounded-full bg-secondary" aria-hidden="true" />
                          Atención: {dayList || "Lunes a Viernes"}
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-fg-muted self-center shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {step === 2 && (
        <section aria-labelledby="step-date-title" className="animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 id="step-date-title" className="text-lg font-semibold text-fg">
              Paso 2: Selecciona la fecha
            </h2>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 min-h-[44px]"
            >
              &larr; Cambiar médico ({selectedDoctor?.name})
            </button>
          </div>

          <div className="max-w-md mx-auto">
            <Calendar
              selectedDate={selectedDate}
              onSelect={(d) => {
                setSelectedDate(d);
                setSelectedTime(null);
                setStep(3);
              }}
              availableDays={availableDays}
            />
          </div>
        </section>
      )}

      {step === 3 && (
        <section aria-labelledby="step-time-title" className="animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 id="step-time-title" className="text-lg font-semibold text-fg">
              Paso 3: Selecciona la hora
            </h2>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 min-h-[44px]"
            >
              &larr; Cambiar fecha
            </button>
          </div>

          <div className="glass-card rounded-[var(--radius-lg)] p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-card-border">
            <div>
              <span className="text-xs text-fg-muted uppercase font-semibold tracking-wider">Atención médica</span>
              <p className="font-semibold text-fg">{selectedDoctor?.name} &bull; {selectedDoctor?.specialty}</p>
            </div>
            <div className="text-sm font-medium text-primary">
              {selectedDate ? formatChileanDate(selectedDate) : ""}
            </div>
          </div>

          {availableTimes.length === 0 ? (
            <div className="glass-card rounded-[var(--radius-xl)] p-8 text-center text-fg-muted">
              <p className="font-medium">No hay horas disponibles para esta fecha.</p>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Seleccionar otra fecha
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 mb-6">
              {availableTimes.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-[var(--radius-md)] border px-4 py-3 text-sm font-semibold transition-all min-h-[44px] ${
                      isSelected
                        ? "border-primary bg-primary text-white shadow-md ring-2 ring-primary/30"
                        : "border-card-border bg-card text-fg hover:border-primary hover:bg-primary-soft"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}

          {selectedTime && (
            <div className="glass-card rounded-[var(--radius-xl)] p-6 flex flex-col gap-5 border border-primary/30 shadow-md">
              <div className="flex items-center gap-2 pb-3 border-b border-card-border">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
                <h3 className="font-bold text-fg text-base">Confirmación de datos</h3>
              </div>

              <dl className="flex flex-col gap-3 text-sm">
                <SummaryRow label="Médico" value={selectedDoctor?.name || ""} />
                <SummaryRow label="Especialidad" value={selectedDoctor?.specialty || ""} />
                <SummaryRow label="Fecha" value={selectedDate ? formatChileanDate(selectedDate) : ""} />
                <SummaryRow label="Hora" value={formatTime(selectedTime)} />
                <SummaryRow label="Paciente" value={`${session.user?.name} (${session.user?.email})`} />
              </dl>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="w-full rounded-[var(--radius-md)] bg-primary px-6 py-3.5 text-sm font-bold text-white hover:bg-primary-hover hover:shadow-md disabled:opacity-50 transition-all min-h-[48px] cursor-pointer"
              >
                {loading ? "Agendando tu hora..." : "Confirmar agendamiento"}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-4">
      <dt className="font-medium text-fg-muted">{label}</dt>
      <dd className="font-semibold text-fg">{value}</dd>
    </div>
  );
}
