"use client";

import React, { useState } from "react";
import { MONTH_NAMES } from "@/lib/constants";

interface CalendarProps {
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  availableDays: Set<number>;
}

const WEEKDAY_HEADERS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function Calendar({
  selectedDate,
  onSelect,
  availableDays,
}: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className="glass-card rounded-[var(--radius-xl)] p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] hover:bg-card-hover transition-colors"
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
          onClick={handleNextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] hover:bg-card-hover transition-colors"
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
          const cellDate = new Date(viewYear, viewMonth, day);
          cellDate.setHours(0, 0, 0, 0);

          const isPast = cellDate < today;
          const isAvailable = availableDays.has(cellDate.getDay()) && !isPast;
          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === cellDate.getFullYear() &&
            selectedDate.getMonth() === cellDate.getMonth() &&
            selectedDate.getDate() === day;

          return (
            <button
              key={day}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelect(cellDate)}
              className={`h-10 w-full rounded-[var(--radius-md)] text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary text-white shadow-sm font-bold ring-2 ring-primary/30"
                  : isAvailable
                    ? "hover:bg-primary-soft hover:text-primary text-fg font-semibold cursor-pointer"
                    : "text-fg-muted/40 cursor-not-allowed"
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
