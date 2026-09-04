import { DAY_NAMES_FULL, MONTH_NAMES } from "./constants";

/**
 * Formats a date string (YYYY-MM-DD) into a friendly Chilean Spanish label, e.g. "Lunes, 12 de Mayo de 2025"
 */
export function formatChileanDate(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(`${dateStr}T12:00:00`) : dateStr;
  const dayName = DAY_NAMES_FULL[date.getDay()];
  const dayNumber = date.getDate();
  const monthName = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${dayNumber} de ${monthName} de ${year}`;
}

/**
 * Returns a short formatted date: "12 May 2025"
 */
export function formatShortDate(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(`${dateStr}T12:00:00`) : dateStr;
  const dayNumber = date.getDate();
  const monthName = MONTH_NAMES[date.getMonth()].slice(0, 3);
  const year = date.getFullYear();

  return `${dayNumber} ${monthName} ${year}`;
}

/**
 * Formats a standard 24h time string like "09:00" to "09:00 hrs"
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  return `${timeStr} hrs`;
}

/**
 * Normalizes a Date or string to YYYY-MM-DD
 */
export function toIsoDateString(d: Date | string): string {
  if (d instanceof Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return d.split("T")[0];
}

/**
 * Simple class names joiner
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
