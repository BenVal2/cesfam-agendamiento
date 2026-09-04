"use client";

import React from "react";
import { AdminStats } from "@/types";
import { formatChileanDate } from "@/lib/utils";

interface AdminDashboardTabProps {
  stats: AdminStats;
}

export function AdminDashboardTab({ stats }: AdminDashboardTabProps) {
  const statCards = [
    { label: "Citas hoy", value: stats.todayAppointments, color: "text-primary", border: "bg-primary" },
    { label: "Esta semana", value: stats.weekAppointments, color: "text-primary", border: "bg-primary" },
    { label: "Este mes", value: stats.monthAppointments, color: "text-primary", border: "bg-primary" },
    { label: "Pacientes", value: stats.totalPatients, color: "text-secondary", border: "bg-secondary" },
    { label: "Confirmadas", value: stats.confirmedAppointments, color: "text-secondary", border: "bg-secondary" },
    { label: "Canceladas", value: stats.cancelledAppointments, color: "text-danger", border: "bg-danger" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="glass-card rounded-[var(--radius-xl)] p-5 text-center relative overflow-hidden shadow-sm"
          >
            <span
              className={`absolute left-0 top-0 bottom-0 w-1 ${card.border}`}
              aria-hidden="true"
            />
            <p className={`text-2xl sm:text-3xl font-bold ${card.color}`}>
              {card.value}
            </p>
            <p className="text-xs text-fg-muted mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-[var(--radius-xl)] p-6 shadow-sm">
          <h3 className="font-bold text-fg mb-4 text-base">Citas por médico</h3>
          {stats.appointmentsByDoctor.length === 0 ? (
            <p className="text-sm text-fg-muted py-4 text-center">No hay registros de citas aún.</p>
          ) : (
            (() => {
              const sorted = [...stats.appointmentsByDoctor].sort((a, b) => b.count - a.count);
              const max = Math.max(...sorted.map((s) => s.count), 1);
              return (
                <div className="flex flex-col gap-4">
                  {sorted.map((item) => (
                    <div key={item.doctor.id}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <div>
                          <span className="font-semibold text-fg">{item.doctor.name}</span>
                          <span className="text-fg-muted text-xs ml-2">({item.doctor.specialty})</span>
                        </div>
                        <span className="font-bold text-primary">{item.count}</span>
                      </div>
                      <div
                        className="h-2 w-full overflow-hidden rounded-full bg-card-border/70"
                        role="img"
                        aria-label={`${item.doctor.name}: ${item.count} citas`}
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                          style={{ width: `${(item.count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>

        <div className="glass-card rounded-[var(--radius-xl)] p-6 shadow-sm">
          <h3 className="font-bold text-fg mb-4 text-base">Próximas atenciones agendadas</h3>
          {stats.recentAppointments.length === 0 ? (
            <p className="text-sm text-fg-muted py-4 text-center">Sin citas programadas actualmente.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {stats.recentAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between text-sm py-2.5 border-b border-card-border last:border-0"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-fg truncate">{appt.user.name}</p>
                    <p className="text-xs text-fg-muted truncate">
                      Atención con: {appt.doctor.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-fg-muted text-xs block">
                      {formatChileanDate(appt.appointmentDate)}
                    </span>
                    <span className="font-bold text-primary text-xs">
                      {appt.appointmentTime} hrs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
