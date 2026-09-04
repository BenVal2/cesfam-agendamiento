"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { Alert } from "@/components/ui/Alert";
import { AdminDashboardTab } from "@/components/admin/AdminDashboardTab";
import { AdminDoctoresTab } from "@/components/admin/AdminDoctoresTab";
import { AdminHorariosTab } from "@/components/admin/AdminHorariosTab";
import { Doctor, Slot, AdminStats } from "@/types";

type AdminTab = "dashboard" | "doctores" | "horarios";

export default function AdminContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = (session?.user as Record<string, unknown>)?.role;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && role !== "admin") {
      router.push("/");
    }
  }, [status, role, router]);

  useEffect(() => {
    if (status === "authenticated" && role === "admin") {
      Promise.all([
        fetch("/api/admin/doctores").then((r) => r.json()),
        fetch("/api/admin/horarios").then((r) => r.json()),
        fetch("/api/admin/stats").then((r) => r.json()),
      ])
        .then(([d, s, st]) => {
          setDoctors(d);
          setSlots(s);
          setStats(st);
        })
        .catch(() => setError("Error al cargar datos administrativos"))
        .finally(() => setLoading(false));
    }
  }, [status, role]);

  if (status === "loading" || loading) {
    return <Loading label="Cargando panel de administración..." />;
  }

  if (!session || role !== "admin") return null;

  return (
    <div id="admin-panel" className="max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-fg mb-1">
          Panel de Administración CESFAM
        </h1>
        <p className="text-fg-secondary text-sm sm:text-base">
          Monitoreo de citas, gestión de profesionales y turnos de atención.
        </p>
      </header>

      {error && (
        <Alert type="danger" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-card-border mb-6 overflow-x-auto pb-0">
        {(
          [
            ["dashboard", "Métricas & Resumen"],
            ["doctores", `Médicos (${doctors.length})`],
            ["horarios", `Franjas Horarias (${slots.length})`],
          ] as const
        ).map(([key, label]) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px] cursor-pointer ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-fg-muted hover:text-fg hover:border-card-border"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {tab === "dashboard" && stats && <AdminDashboardTab stats={stats} />}
      {tab === "doctores" && (
        <AdminDoctoresTab
          doctors={doctors}
          setDoctors={setDoctors}
          setError={setError}
        />
      )}
      {tab === "horarios" && (
        <AdminHorariosTab
          doctors={doctors}
          slots={slots}
          setSlots={setSlots}
          setError={setError}
        />
      )}
    </div>
  );
}
