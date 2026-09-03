"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "@/components/Loading";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availableSlots: { dayOfWeek: number }[];
}

const DAY_NAMES = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ["Médico", "Fecha", "Hora"];
  return (
    <nav aria-label="Progreso del agendamiento" className="mb-8">
      <ol className="flex items-center justify-center gap-2 sm:gap-3">
        {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
          <li key={step} className="flex items-center gap-2 sm:gap-3">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                step === current
                  ? "bg-primary text-white shadow-md"
                  : step < current
                    ? "bg-secondary text-white"
                    : "bg-card-border text-fg-muted"
              }`}
              aria-current={step === current ? "step" : undefined}
            >
              {step < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                step
              )}
            </span>
            <span className={`text-xs font-medium hidden sm:inline ${step === current ? "text-primary" : step < current ? "text-secondary" : "text-fg-muted"}`}>
              {labels[step - 1]}
            </span>
            {step < total && (
              <div className={`h-0.5 w-6 sm:w-10 ${step < current ? "bg-secondary" : "bg-card-border"}`} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
      <p className="text-center text-xs text-fg-muted mt-3">Paso {current} de {total}</p>
    </nav>
  );
}

function Calendar({
  selectedDate,
  onSelect,
  availableDays,
}: {
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  availableDays: Set<number>;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="glass-card rounded-[var(--radius-xl)] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => viewMonth === 0 ? (setViewMonth(11), setViewYear((y) => y - 1)) : setViewMonth((m) => m - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] hover:bg-card-hover transition-colors"
          aria-label="Mes anterior"
        >
          <svg className="w-5 h-5 text-fg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h3 className="font-semibold text-fg">{MONTH_NAMES[viewMonth]} {viewYear}</h3>
        <button
          onClick={() => viewMonth === 11 ? (setViewMonth(0), setViewYear((y) => y + 1)) : setViewMonth((m) => m + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] hover:bg-card-hover transition-colors"
          aria-label="Mes siguiente"
        >
          <svg className="w-5 h-5 text-fg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-fg-muted mb-2">
        {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d) => (
          <div key={d} className="py-1.5 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const date = new Date(viewYear, viewMonth, day);
          date.setHours(0, 0, 0, 0);
          const isPast = date < today;
          const isToday = date.getTime() === today.getTime();
          const isSelected = selectedDate?.getTime() === date.getTime();
          const isAvailable = availableDays.has(date.getDay()) && !isPast;

          return (
            <button
              key={day}
              onClick={() => isAvailable && onSelect(date)}
              disabled={!isAvailable}
              aria-label={`${day} de ${MONTH_NAMES[viewMonth]}${isAvailable ? ", disponible" : ""}`}
              className={`aspect-square rounded-[var(--radius-md)] text-sm font-medium transition-all min-h-[40px] ${
                isSelected
                  ? "bg-primary text-white shadow-md"
                  : isToday
                    ? "ring-2 ring-primary text-primary font-bold"
                    : isAvailable
                      ? "hover:bg-primary-soft text-fg cursor-pointer"
                      : "text-fg-muted cursor-not-allowed opacity-30"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
    if (status === "unauthenticated") router.push("/login");
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
    if (!selectedDoctor) return new Set<number>();
    const days = new Set<number>();
    for (const slot of selectedDoctor.availableSlots) days.add(slot.dayOfWeek);
    return days;
  }, [selectedDoctor])();

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) { setAvailableTimes([]); return; }
    const dateStr = selectedDate.toISOString().split("T")[0];
    fetch(`/api/horas-disponibles?doctorId=${selectedDoctor.id}&date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => setAvailableTimes(data.availableTimes || []))
      .catch(() => setAvailableTimes([]));
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
        body: JSON.stringify({ doctorId: selectedDoctor.id, date: dateStr, time: selectedTime }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Error al crear la cita"); }
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally { setLoading(false); }
  }

  if (status === "loading") return <Loading label="Cargando tu sesión..." />;
  if (!session) return null;

  if (success) {
    return (
        <div className="max-w-md mx-auto text-center py-12 space-y-6">
          <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto ring-2 ring-success-bg">
            <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-fg">¡Cita agendada!</h1>
            <p className="text-sm text-fg-secondary">Recibirás la confirmación de tu hora médica.</p>
          </div>
          <dl className="glass-card rounded-[var(--radius-xl)] p-6 text-left space-y-3">
            <SummaryRow label="Doctor" value={selectedDoctor?.name || ""} />
            <SummaryRow label="Fecha" value={selectedDate?.toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) || ""} />
            <SummaryRow label="Hora" value={selectedTime || ""} />
          </dl>
          <Link href="/mis-citas" className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover hover:shadow-md transition-all min-h-[48px]">
            Ver mis citas
          </Link>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-fg mb-2">Agendar hora</h1>
      <p className="text-fg-secondary mb-8">Selecciona un médico, fecha y hora para tu consulta.</p>
      <StepIndicator current={step} total={3} />

      {error && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-danger/30 p-4 text-sm font-medium text-danger bg-danger-soft" role="alert">
          {error}
        </div>
      )}

      {step === 1 && (
        <section aria-labelledby="paso-doctor">
          <h2 id="paso-doctor" className="text-lg font-semibold text-fg mb-4">Selecciona tu médico</h2>
          {doctors.length === 0 ? (
            <p className="text-center py-10 text-fg-muted">Cargando doctores disponibles...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map((doctor) => {
                const days = new Set(doctor.availableSlots.map((s) => s.dayOfWeek));
                const dayList = [1, 2, 3, 4, 5].filter((d) => days.has(d)).map((d) => DAY_NAMES[d]).join(", ");
                return (
                  <button
                    key={doctor.id}
                    onClick={() => { setSelectedDoctor(doctor); setStep(2); }}
                    className="glass-card group text-left rounded-[var(--radius-xl)] p-5 hover:border-primary hover:-translate-y-0.5 hover:shadow-md transition-all min-h-[44px]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
                        {(() => {
                          const parts = doctor.name.split(" ").filter((w) => !/^(Dr|Dra|Doctor|Doctora)\.?$/i.test(w));
                          const initials = parts.slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
                          return initials || "MD";
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-fg group-hover:text-primary transition-colors">{doctor.name}</h3>
                        <p className="text-sm text-fg-secondary">{doctor.specialty}</p>
                        <p className="text-xs text-primary mt-1.5 inline-flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden="true"></span>
                          Disponible: {dayList}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-fg-muted self-center shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
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
        <section aria-labelledby="paso-fecha">
          <h2 id="paso-fecha" className="text-lg font-semibold text-fg mb-4">Selecciona la fecha</h2>
          <div className="max-w-sm">
            <Calendar
              selectedDate={selectedDate}
              onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); setStep(3); }}
              availableDays={availableDays}
            />
          </div>
          <button onClick={() => setStep(1)} className="mt-4 text-sm font-medium text-primary hover:underline min-h-[44px] inline-flex items-center">&larr; Volver a doctores</button>
        </section>
      )}

      {step === 3 && (
        <section aria-labelledby="paso-hora">
          <h2 id="paso-hora" className="text-lg font-semibold text-fg mb-4">Selecciona la hora</h2>
          <p className="text-sm text-fg-secondary mb-4">
            {selectedDoctor?.name} &bull; {selectedDate?.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
          </p>

          {availableTimes.length === 0 ? (
            <p className="text-center text-fg-muted py-8">No hay horas disponibles para esta fecha.</p>
          ) : (
            <div className="grid grid-cols-3 min-[400px]:grid-cols-4 gap-2 mb-6">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-[var(--radius-md)] border px-4 py-3 text-sm font-medium transition-all min-h-[44px] ${
                    selectedTime === time
                      ? "border-primary bg-primary text-white shadow-md"
                      : "border-card-border bg-card text-fg hover:border-primary hover:bg-primary-soft"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}

          {selectedTime && (
            <div className="glass-card rounded-[var(--radius-xl)] p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-card-border">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-soft text-secondary" aria-hidden="true">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
                <h3 className="font-semibold text-fg">Resumen de tu cita</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <SummaryRow label="Doctor" value={selectedDoctor?.name || ""} />
                <SummaryRow label="Fecha" value={selectedDate?.toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) || ""} />
                <SummaryRow label="Hora" value={selectedTime || ""} />
                <SummaryRow label="Paciente" value={`${session?.user?.name} (${session?.user?.email})`} />
              </dl>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover hover:shadow-md disabled:opacity-50 transition-all min-h-[48px]"
              >
                {loading ? "Confirmando..." : "Confirmar cita"}
              </button>
            </div>
          )}

          <button onClick={() => setStep(2)} className="mt-4 text-sm font-medium text-primary hover:underline min-h-[44px] inline-flex items-center">&larr; Volver al calendario</button>
        </section>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-4">
      <dt className="font-medium text-fg-muted">{label}</dt>
      <dd className="font-medium text-fg">{value}</dd>
    </div>
  );
}
