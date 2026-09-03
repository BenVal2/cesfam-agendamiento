"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "@/components/Loading";

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  doctor: { name: string; specialty: string };
}

export default function MisCitasContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/citas`)
        .then((r) => r.json())
        .then(setAppointments)
        .catch(() => setError("Error al cargar citas"))
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  async function handleCancel(id: string) {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/citas?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al cancelar");
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("Error al cancelar la cita. Intenta nuevamente.");
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
    }
  }

  if (status === "loading" || loading) return <Loading label="Cargando tus citas..." />;
  if (!session) return null;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-fg mb-2">Mis Citas</h1>
      <p className="text-fg-secondary mb-8">Tus citas médicas agendadas.</p>

      {error && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-danger/30 p-4 text-sm font-medium text-danger bg-danger-soft" role="alert">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="glass-card rounded-[var(--radius-xl)] p-10 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-fg mb-1">Aún no tienes citas</h2>
          <p className="text-fg-secondary mb-6">
            Cuando agendes una hora médica, aparecerá aquí para que puedas consultar o cancelarla cuando quieras.
          </p>
          <Link href="/agendar" className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover hover:shadow-md transition-all min-h-[48px]">
            Agendar mi primera hora
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {appointments.map((apt) => {
            const date = new Date(apt.appointmentDate + "T12:00:00");
            const isConfirming = confirmCancelId === apt.id;
            return (
              <li key={apt.id} className="glass-card rounded-[var(--radius-xl)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-primary-soft flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-fg">{apt.doctor.name}</p>
                    <p className="text-sm text-fg-secondary">{apt.doctor.specialty}</p>
                    <p className="text-sm text-fg-secondary mt-1">
                      {date.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} &bull; {apt.appointmentTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  {isConfirming ? (
                    <div className="flex items-center gap-2 bg-danger-soft border border-danger/20 rounded-[var(--radius-lg)] p-2">
                      <span className="text-xs text-danger font-medium px-1">¿Confirmas?</span>
                      <button
                        onClick={() => handleCancel(apt.id)}
                        disabled={cancellingId === apt.id}
                        className="rounded-[var(--radius-md)] bg-danger px-3 py-1.5 text-xs font-semibold text-white hover:bg-danger-hover disabled:opacity-50 transition-colors min-h-[36px]"
                      >
                        {cancellingId === apt.id ? "Cancelando..." : "Sí"}
                      </button>
                      <button
                        onClick={() => setConfirmCancelId(null)}
                        disabled={cancellingId === apt.id}
                        className="rounded-[var(--radius-md)] border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-fg hover:bg-card-hover disabled:opacity-50 transition-colors min-h-[36px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmCancelId(apt.id)}
                      disabled={cancellingId === apt.id}
                      className="rounded-[var(--radius-md)] border border-danger/40 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger hover:text-white disabled:opacity-50 transition-colors min-h-[44px]"
                    >
                      {cancellingId === apt.id ? "Cancelando..." : "Cancelar cita"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
