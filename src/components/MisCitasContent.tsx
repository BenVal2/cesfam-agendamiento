"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "@/components/Loading";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Appointment } from "@/types";
import { formatChileanDate, formatTime } from "@/lib/utils";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/constants";

export default function MisCitasContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cancellation modal state
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/citas`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAppointments(data);
          }
        })
        .catch(() => setError("Error al cargar tus citas"))
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  async function handleConfirmCancel() {
    if (!appointmentToCancel) return;
    setIsCancelling(true);
    setError(null);

    try {
      const res = await fetch(`/api/citas?id=${appointmentToCancel.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al cancelar la cita");

      // Update local state to show cancelled or filter out
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentToCancel.id ? { ...a, status: "cancelled" } : a
        )
      );
      setSuccessMessage("La cita fue cancelada correctamente.");
    } catch {
      setError("Error al cancelar la cita. Intenta nuevamente.");
    } finally {
      setIsCancelling(false);
      setAppointmentToCancel(null);
    }
  }

  if (status === "loading" || loading) {
    return <Loading label="Cargando tus citas..." />;
  }
  if (!session) return null;

  return (
    <div id="mis-citas-container" className="max-w-4xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-fg">Mis Citas</h1>
          <p className="text-fg-secondary mt-1 text-sm sm:text-base">
            Historial y próximas atenciones médicas registradas a tu nombre.
          </p>
        </div>
        <Link
          href="/agendar"
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-all self-start sm:self-auto min-h-[44px]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva cita
        </Link>
      </header>

      {error && (
        <Alert type="danger" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert type="success" className="mb-6" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {appointments.length === 0 ? (
        <div className="glass-card rounded-[var(--radius-xl)] p-10 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-fg mb-1">Aún no tienes citas registradas</h2>
          <p className="text-fg-secondary text-sm mb-6">
            Cuando agendes una atención con uno de nuestros médicos, podrás revisarla y gestionarla aquí.
          </p>
          <Link
            href="/agendar"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover hover:shadow-md transition-all min-h-[48px]"
          >
            Agendar mi primera hora
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4" role="list">
          {appointments.map((apt) => {
            const isCancelled = apt.status === "cancelled";
            const badgeVariant = isCancelled ? "danger" : "success";

            return (
              <li
                key={apt.id}
                className={`glass-card rounded-[var(--radius-xl)] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isCancelled ? "opacity-60 bg-card/40" : "hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${
                      isCancelled ? "bg-card-border text-fg-muted" : "bg-primary-soft text-primary"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-fg text-base">{apt.doctor.name}</h3>
                      <Badge variant={badgeVariant}>
                        {APPOINTMENT_STATUS_LABELS[apt.status] || apt.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-fg-secondary">{apt.doctor.specialty}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs font-medium text-fg flex-wrap">
                      <span className="inline-flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-[var(--radius-sm)] border border-card-border">
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25" />
                        </svg>
                        {formatChileanDate(apt.appointmentDate)}
                      </span>

                      <span className="inline-flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-[var(--radius-sm)] border border-card-border">
                        <svg className="w-3.5 h-3.5 text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {formatTime(apt.appointmentTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {!isCancelled && (
                  <div className="flex sm:flex-col items-end justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-card-border">
                    <button
                      type="button"
                      onClick={() => setAppointmentToCancel(apt)}
                      className="text-xs font-medium text-danger hover:bg-danger-soft px-3 py-2 rounded-[var(--radius-md)] transition-colors min-h-[44px] cursor-pointer"
                    >
                      Cancelar cita
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={Boolean(appointmentToCancel)}
        onClose={() => setAppointmentToCancel(null)}
        title="¿Cancelar cita médica?"
        description="Esta acción liberará la hora para que otro paciente pueda agendarla."
        confirmLabel="Sí, cancelar cita"
        confirmVariant="danger"
        loading={isCancelling}
        onConfirm={handleConfirmCancel}
      >
        {appointmentToCancel && (
          <div className="p-3 bg-card-hover rounded-[var(--radius-lg)] text-sm space-y-1">
            <p>
              <strong>Médico:</strong> {appointmentToCancel.doctor.name}
            </p>
            <p>
              <strong>Fecha:</strong> {formatChileanDate(appointmentToCancel.appointmentDate)}
            </p>
            <p>
              <strong>Hora:</strong> {formatTime(appointmentToCancel.appointmentTime)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
