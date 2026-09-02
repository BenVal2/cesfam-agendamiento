"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAY_NAMES_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface Doctor { id: string; name: string; specialty: string; active: boolean; availableSlots: Slot[]; }
interface Slot { id: string; doctorId: string; dayOfWeek: number; startTime: string; endTime: string; durationMinutes: number; doctor?: { id: string; name: string }; }
type Tab = "dashboard" | "doctores" | "horarios";
interface Stats {
  totalAppointments: number; confirmedAppointments: number; cancelledAppointments: number;
  todayAppointments: number; weekAppointments: number; monthAppointments: number; totalPatients: number;
  appointmentsByDoctor: { doctor: { id: string; name: string; specialty: string }; count: number }[];
  appointmentsByDay: { date: string; count: number }[];
  recentAppointments: { id: string; appointmentDate: string; appointmentTime: string; status: string; doctor: { name: string; specialty: string }; user: { name: string; email: string } }[];
}

const inputClass = "w-full rounded-[var(--radius-md)] border border-input-border bg-input-bg px-3 py-2.5 text-sm text-fg focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-input-ring transition-shadow min-h-[44px]";

export default function AdminContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = (session?.user as Record<string, unknown>)?.role;

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); if (status === "authenticated" && role !== "admin") router.push("/"); }, [status, role, router]);
  useEffect(() => {
    if (status === "authenticated" && role === "admin") {
      Promise.all([fetch("/api/admin/doctores").then((r) => r.json()), fetch("/api/admin/horarios").then((r) => r.json()), fetch("/api/admin/stats").then((r) => r.json())])
        .then(([d, s, st]) => { setDoctors(d); setSlots(s); setStats(st); })
        .catch(() => setError("Error al cargar datos")).finally(() => setLoading(false));
    }
  }, [status, role]);

  if (status === "loading" || loading) return <div className="text-center py-12 text-fg-muted">Cargando panel admin...</div>;
  if (!session || role !== "admin") return null;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-fg mb-2">Panel de Administración</h1>
      <p className="text-fg-secondary mb-8">Gestiona doctores, horarios y revisa métricas del CESFAM.</p>

      {error && <div className="mb-6 rounded-[var(--radius-lg)] border border-danger/30 p-4 text-sm font-medium text-danger bg-danger-soft" role="alert">{error}</div>}

      <div className="flex gap-1 border-b border-card-border mb-6 overflow-x-auto">
        {([["dashboard", "Dashboard"], ["doctores", `Doctores (${doctors.length})`], ["horarios", `Horarios (${slots.length})`] ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${tab === key ? "border-primary text-primary" : "border-transparent text-fg-muted hover:text-fg"}`}>{label}</button>
        ))}
      </div>

      {tab === "dashboard" && stats && <DashboardTab stats={stats} />}
      {tab === "doctores" && <DoctoresTab doctors={doctors} setDoctors={setDoctors} setError={setError} />}
      {tab === "horarios" && <HorariosTab doctors={doctors} slots={slots} setSlots={setSlots} setError={setError} />}
    </div>
  );
}

function DoctoresTab({ doctors, setDoctors, setError }: { doctors: Doctor[]; setDoctors: (d: Doctor[]) => void; setError: (e: string | null) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("Medicina General");

  async function handleSave() {
    if (!name.trim()) return;
    try {
      if (editingId) {
        const res = await fetch("/api/admin/doctores", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, name, specialty }) });
        if (!res.ok) throw new Error("Error al actualizar");
        const updated = await res.json();
        setDoctors(doctors.map((d) => (d.id === editingId ? { ...d, ...updated } : d)));
      } else {
        const res = await fetch("/api/admin/doctores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, specialty }) });
        if (!res.ok) throw new Error("Error al crear");
        const created = await res.json();
        setDoctors([...doctors, { ...created, availableSlots: [], active: true }]);
      }
      resetForm();
    } catch { setError("Error al guardar doctor"); }
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      if (active) { await fetch("/api/admin/doctores", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active: true }) }); setDoctors(doctors.map((d) => (d.id === id ? { ...d, active: true } : d))); }
      else { await fetch(`/api/admin/doctores?id=${id}`, { method: "DELETE" }); setDoctors(doctors.map((d) => (d.id === id ? { ...d, active: false } : d))); }
    } catch { setError("Error al cambiar estado"); }
  }

  function resetForm() { setShowForm(false); setEditingId(null); setName(""); setSpecialty("Medicina General"); }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-fg">Doctores</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="rounded-[var(--radius-md)] bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors min-h-[44px]">+ Nuevo doctor</button>
      </div>
      {showForm && (
        <div className="mb-6 glass-card rounded-[var(--radius-xl)] p-5 space-y-4">
          <h3 className="font-medium text-fg">{editingId ? "Editar doctor" : "Nuevo doctor"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label htmlFor="doc-name" className="block text-sm font-medium text-fg mb-1.5">Nombre</label><input id="doc-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Dr. Nombre Apellido" /></div>
            <div><label htmlFor="doc-specialty" className="block text-sm font-medium text-fg mb-1.5">Especialidad</label><input id="doc-specialty" type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={inputClass} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="rounded-[var(--radius-md)] bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors min-h-[44px]">{editingId ? "Actualizar" : "Crear"}</button>
            <button onClick={resetForm} className="rounded-[var(--radius-md)] border border-card-border px-4 py-2.5 text-sm text-fg-muted hover:bg-card-hover transition-colors min-h-[44px]">Cancelar</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {doctors.map((doctor) => (
          <div key={doctor.id} className={`glass-card rounded-[var(--radius-xl)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${!doctor.active ? "opacity-60" : ""}`}>
            <div>
              <p className="font-semibold text-fg">{doctor.name}</p>
              <p className="text-sm text-fg-secondary">{doctor.specialty}</p>
              <p className="text-xs text-fg-muted mt-1">{doctor.availableSlots.length} franjas horarias &bull; <span className={doctor.active ? "text-secondary" : "text-danger"}>{doctor.active ? "Activo" : "Inactivo"}</span></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditingId(doctor.id); setName(doctor.name); setSpecialty(doctor.specialty); setShowForm(true); }} className="rounded-[var(--radius-md)] border border-card-border px-3 py-2 text-xs font-medium text-fg-muted hover:bg-card-hover transition-colors min-h-[44px]">Editar</button>
              <button onClick={() => handleToggle(doctor.id, !doctor.active)} className={`rounded-[var(--radius-md)] border px-3 py-2 text-xs font-medium transition-colors min-h-[44px] ${doctor.active ? "border-danger/40 text-danger hover:bg-danger hover:text-white" : "border-secondary/40 text-secondary hover:bg-secondary hover:text-white"}`}>{doctor.active ? "Desactivar" : "Activar"}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorariosTab({ doctors, slots, setSlots, setError }: { doctors: Doctor[]; slots: Slot[]; setSlots: (s: Slot[]) => void; setError: (e: string | null) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [durationMinutes, setDurationMinutes] = useState(30);

  async function handleSave() {
    if (!doctorId) return;
    try {
      const res = await fetch("/api/admin/horarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doctorId, dayOfWeek, startTime, endTime, durationMinutes }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Error al crear"); }
      const created = await res.json();
      const doctor = doctors.find((d) => d.id === doctorId);
      setSlots([...slots, { ...created, doctor: doctor ? { id: doctor.id, name: doctor.name } : undefined }]);
      setShowForm(false); setDoctorId(""); setStartTime("09:00"); setEndTime("12:00");
    } catch (e) { setError(e instanceof Error ? e.message : "Error al guardar horario"); }
  }

  async function handleDelete(id: string) {
    try { await fetch(`/api/admin/horarios?id=${id}`, { method: "DELETE" }); setSlots(slots.filter((s) => s.id !== id)); }
    catch { setError("Error al eliminar horario"); }
  }

  const groupedByDoctor = doctors.reduce((acc, doctor) => { acc[doctor.id] = { doctor, slots: slots.filter((s) => s.doctorId === doctor.id) }; return acc; }, {} as Record<string, { doctor: Doctor; slots: Slot[] }>);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-fg">Horarios por doctor</h2>
        <button onClick={() => setShowForm(true)} className="rounded-[var(--radius-md)] bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors min-h-[44px]">+ Nuevo horario</button>
      </div>
      {showForm && (
        <div className="mb-6 glass-card rounded-[var(--radius-xl)] p-5 space-y-4">
          <h3 className="font-medium text-fg">Nuevo horario</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label htmlFor="slot-doctor" className="block text-sm font-medium text-fg mb-1.5">Doctor</label><select id="slot-doctor" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={inputClass}><option value="">Seleccionar...</option>{doctors.filter((d) => d.active).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label htmlFor="slot-day" className="block text-sm font-medium text-fg mb-1.5">Día</label><select id="slot-day" value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className={inputClass}>{[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{DAY_NAMES_FULL[d]}</option>)}</select></div>
            <div><label htmlFor="slot-start" className="block text-sm font-medium text-fg mb-1.5">Inicio</label><input id="slot-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} /></div>
            <div><label htmlFor="slot-end" className="block text-sm font-medium text-fg mb-1.5">Fin</label><input id="slot-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} /></div>
            <div><label htmlFor="slot-duration" className="block text-sm font-medium text-fg mb-1.5">Duración (min)</label><input id="slot-duration" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} min={15} max={120} step={15} className={inputClass} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={!doctorId} className="rounded-[var(--radius-md)] bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors min-h-[44px]">Crear horario</button>
            <button onClick={() => setShowForm(false)} className="rounded-[var(--radius-md)] border border-card-border px-4 py-2.5 text-sm text-fg-muted hover:bg-card-hover transition-colors min-h-[44px]">Cancelar</button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {Object.values(groupedByDoctor).map(({ doctor, slots: doctorSlots }) => (
          <div key={doctor.id} className="glass-card rounded-[var(--radius-xl)] p-5">
            <h3 className="font-semibold text-fg mb-3">{doctor.name}</h3>
            {doctorSlots.length === 0 ? <p className="text-sm text-fg-muted">Sin horarios configurados</p> : (
              <div className="flex flex-wrap gap-2">
                {doctorSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-card-border px-3 py-2 text-sm">
                    <span className="font-medium text-fg">{DAY_NAMES[slot.dayOfWeek]}</span>
                    <span className="text-fg-muted">{slot.startTime} - {slot.endTime}</span>
                    <span className="text-xs text-fg-muted">({slot.durationMinutes}min)</span>
                    <button onClick={() => handleDelete(slot.id)} className="ml-1 text-danger hover:text-danger-hover transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={`Eliminar horario ${DAY_NAMES[slot.dayOfWeek]} ${slot.startTime}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
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

function DashboardTab({ stats }: { stats: Stats }) {
  const statCards = [
    { label: "Citas hoy", value: stats.todayAppointments, color: "text-primary" },
    { label: "Esta semana", value: stats.weekAppointments, color: "text-primary" },
    { label: "Este mes", value: stats.monthAppointments, color: "text-primary" },
    { label: "Pacientes", value: stats.totalPatients, color: "text-secondary" },
    { label: "Confirmadas", value: stats.confirmedAppointments, color: "text-secondary" },
    { label: "Canceladas", value: stats.cancelledAppointments, color: "text-danger" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="glass-card rounded-[var(--radius-xl)] p-4 text-center">
            <p className={`text-2xl sm:text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-fg-muted mt-1">{card.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-[var(--radius-xl)] p-5">
          <h3 className="font-semibold text-fg mb-4">Citas por doctor</h3>
          {stats.appointmentsByDoctor.length === 0 ? <p className="text-sm text-fg-muted">Sin datos</p> : (
            <div className="space-y-2">
              {stats.appointmentsByDoctor.sort((a, b) => b.count - a.count).map((item) => (
                <div key={item.doctor.id} className="flex items-center justify-between text-sm">
                  <div><span className="font-medium text-fg">{item.doctor.name}</span><span className="text-fg-muted ml-2">({item.doctor.specialty})</span></div>
                  <span className="font-semibold text-primary">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="glass-card rounded-[var(--radius-xl)] p-5">
          <h3 className="font-semibold text-fg mb-4">Próximas citas</h3>
          {stats.recentAppointments.length === 0 ? <p className="text-sm text-fg-muted">Sin citas programadas</p> : (
            <div className="space-y-2">
              {stats.recentAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between text-sm py-2 border-b border-card-border last:border-0">
                  <div><span className="font-medium text-fg">{appt.user.name}</span><span className="text-fg-muted ml-2">→ {appt.doctor.name}</span></div>
                  <div className="text-right"><span className="text-fg-muted text-xs block">{new Date(appt.appointmentDate + "T12:00:00").toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })}</span><span className="font-medium text-primary text-xs">{appt.appointmentTime}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
