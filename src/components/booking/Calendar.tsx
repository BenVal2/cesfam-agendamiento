"use client";

import React, { useState } from "react";
import { MONTH_NAMES } from "@/lib/constants";
import { BOOKING_WINDOW_DAYS, clinicNow, holidayName, weekday } from "@/lib/clinic-time";

interface CalendarProps {
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  availableDays: Set<number>;
  todayBookable?: boolean;
}

const WEEKDAY_HEADERS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function Calendar({
  selectedDate,
  onSelect,
  availableDays,
  todayBookable = true,
}: CalendarProps) {
  const { date: today } = clinicNow();
  const maxDate = new Date(today + "T00:00:00.000Z");
  maxDate.setUTCDate(maxDate.getUTCDate() + BOOKING_WINDOW_DAYS);
  const maxStr = maxDate.toISOString().slice(0, 10);

  const [viewMonth, setViewMonth] = useState(Number(today.slice(5, 7)) - 1);
  const [viewYear, setViewYear] = useState(Number(today.slice(0, 4)));

  const firstDay = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const currentMonthKey = Number(today.slice(0, 4)) * 12 + (Number(today.slice(5, 7)) - 1);
  const viewKey = viewYear * 12 + viewMonth;
  const maxMonthKey = Number(maxStr.slice(0, 4)) * 12 + (Number(maxStr.slice(5, 7)) - 1);
  const canPrev = viewKey > currentMonthKey;
  const canNext = viewKey < maxMonthKey;

  function moveMonth(delta: number) {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
  }

  return (
    <div className="glass-panel rounded-[var(--radius-xl)] p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => canPrev && moveMonth(-1)}
          disabled={!canPrev}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] hover:bg-card-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Mes anterior"
        >
          <svg className="w-5 h-5 text-fg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        <h3 className="font-semibold text-fg text-base">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>

        <button
          type="button"
          onClick={() => canNext && moveMonth(1)}
          disabled={!canNext}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] hover:bg-card-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Mes siguiente"
        >
          <svg className="w-5 h-5 text-fg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-fg-muted mb-2">
        {WEEKDAY_HEADERS.map((name) => (
          <div key={name} className="py-1">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-sm">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const mm = String(viewMonth + 1).padStart(2, "0");
          const dd = String(day).padStart(2, "0");
          const dateStr = `${viewYear}-${mm}-${dd}`;

          const isPast = dateStr < today;
          const isBeyond = dateStr > maxStr;
          const holiday = holidayName(dateStr);
          const noAttention = !availableDays.has(weekday(dateStr));
          const isTodayBlocked = dateStr === today && !todayBookable;
          const isAvailable = !isPast && !isBeyond && !holiday && !noAttention && !isTodayBlocked;

          const isSelected =
            selectedDate && selectedDate.toISOString().slice(0, 10) === dateStr;
          const isToday = dateStr === today;

          const reason = holiday
            ? `Feriado: ${holiday}`
            : isPast
              ? "Fecha pasada"
              : isBeyond
                ? `Solo se puede agendar hasta ${BOOKING_WINDOW_DAYS} días adelante`
                : noAttention
                  ? "El profesional no atiende este día"
                  : isTodayBlocked
                    ? "Ya no quedan horas para hoy"
                    : undefined;

          return (
            <button
              key={day}
              type="button"
              disabled={!isAvailable}
              onClick={() => {
                if (!isAvailable) return;
                onSelect(new Date(dateStr + "T00:00:00.000Z"));
              }}
              title={reason}
              aria-label={`${day} de ${MONTH_NAMES[viewMonth]}${reason ? ". " + reason : ", disponible"}`}
              aria-pressed={Boolean(isSelected)}
              aria-current={isToday ? "date" : undefined}
              className={`h-11 w-full rounded-[var(--radius-md)] text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary text-on-primary shadow-sm font-bold ring-2 ring-primary/30"
                  : isAvailable
                    ? `hover:bg-primary-soft hover:text-primary text-fg font-semibold cursor-pointer ${isToday ? "ring-1 ring-primary" : ""}`
                    : "text-fg-muted/40 cursor-not-allowed"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-fg-muted">
        Feriados y días sin atención no se pueden seleccionar. Agenda hasta{" "}
        {BOOKING_WINDOW_DAYS} días adelante.
      </p>
    </div>
  );
}
