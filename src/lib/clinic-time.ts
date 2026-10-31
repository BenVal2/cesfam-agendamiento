/**
 * Reglas de agenda del CESFAM.
 *
 * Todo el sistema trabaja con fechas "YYYY-MM-DD" (sin hora) y una zona
 * explícita: America/Santiago.
 */

import { holidayName } from "./holidays";

export { holidayName };

export const CLINIC_TZ = "America/Santiago";
export const BOOKING_CUTOFF_MINUTES = 120;
export const BOOKING_WINDOW_DAYS = 30;
export const MAX_OPEN_APPOINTMENTS = 2;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function isValidTime(value: unknown): value is string {
  return typeof value === "string" && TIME_RE.test(value);
}

export function clinicNow(now: Date = new Date()): { date: string; minutes: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(now)) {
    if (p.type !== "literal") parts[p.type] = p.value;
  }
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function timeFromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekday(date: string): number {
  return new Date(`${date}T00:00:00.000Z`).getUTCDay();
}

export function daysBetween(a: string, b: string): number {
  const ms = new Date(`${b}T00:00:00.000Z`).getTime() - new Date(`${a}T00:00:00.000Z`).getTime();
  return Math.round(ms / 86_400_000);
}

export function toDbDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function fromDbDate(value: Date | string): string {
  const iso = value instanceof Date ? value.toISOString() : value;
  return iso.slice(0, 10);
}

export function formatDateLong(date: string): string {
  const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const d = new Date(`${date}T00:00:00.000Z`);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}

export function formatDateFull(date: string): string {
  const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const d = new Date(`${date}T00:00:00.000Z`);
  const dayName = DAYS[d.getUTCDay()];
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

export function dateError(date: string, now: Date = new Date()): string | null {
  if (!isValidDateOnly(date)) return "La fecha no es válida.";
  const { date: today } = clinicNow(now);
  const diff = daysBetween(today, date);
  if (diff < 0) return "Esa fecha ya pasó.";
  if (diff > BOOKING_WINDOW_DAYS) return `Solo puedes agendar hasta ${BOOKING_WINDOW_DAYS} días hacia adelante.`;
  const holiday = holidayName(date);
  if (holiday) return `Ese día el centro no atiende por feriado (${holiday}).`;
  return null;
}

export function timeError(date: string, time: string, now: Date = new Date()): string | null {
  if (!isValidTime(time)) return "La hora no es válida.";
  const clinic = clinicNow(now);
  if (date !== clinic.date) return null;
  const ahead = minutesOf(time) - clinic.minutes;
  if (ahead < BOOKING_CUTOFF_MINUTES) return "Debes reservar con al menos 2 horas de anticipación. Elige otra fecha.";
  return null;
}

export interface SlotLike {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export function timesForSlot(slot: SlotLike): string[] {
  const start = minutesOf(slot.startTime);
  const end = minutesOf(slot.endTime);
  const step = slot.durationMinutes > 0 ? slot.durationMinutes : 30;
  const times: string[] = [];
  for (let m = start; m + step <= end; m += step) times.push(timeFromMinutes(m));
  return times;
}

export function isTimeInSchedule(time: string, slots: SlotLike[]): boolean {
  if (!isValidTime(time)) return false;
  return slots.some((slot) => timesForSlot(slot).includes(time));
}

export function hasBookableSlotToday(slots: SlotLike[], dayOfWeek: number, now: Date = new Date()): boolean {
  const clinic = clinicNow(now);
  if (weekday(clinic.date) !== dayOfWeek) return false;
  if (holidayName(clinic.date)) return false;
  return slots.some((slot) => timesForSlot(slot).some((time) => minutesOf(time) - clinic.minutes >= BOOKING_CUTOFF_MINUTES));
}

export function isDateInWindow(date: string, now: Date = new Date()): boolean {
  const { date: today } = clinicNow(now);
  const diff = daysBetween(today, date);
  return diff >= 0 && diff <= BOOKING_WINDOW_DAYS;
}
