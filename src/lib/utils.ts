import { DAY_NAMES_FULL, MONTH_NAMES } from "./constants";

/**
 * Formats a date string (YYYY-MM-DD) into a friendly Chilean Spanish label, e.g. "Lunes, 12 de Mayo de 2025"
 */
function toDateOnly(value: string | Date): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export function formatChileanDate(dateStr: string | Date): string {
  const date = toDateOnly(dateStr);
  const d = new Date(`${date}T12:00:00`);
  const dayName = DAY_NAMES_FULL[d.getDay()];
  const dayNumber = d.getDate();
  const monthName = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${dayNumber} de ${monthName} de ${year}`;
}

export function formatShortDate(dateStr: string | Date): string {
  const date = toDateOnly(dateStr);
  const d = new Date(`${date}T12:00:00`);
  const dayNumber = d.getDate();
  const monthName = MONTH_NAMES[d.getMonth()].slice(0, 3);
  const year = d.getFullYear();
  return `${dayNumber} ${monthName} ${year}`;
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  return `${timeStr} hrs`;
}

export function toIsoDateString(d: Date | string): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).split("T")[0];
}

/**
 * Simple class names joiner
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
