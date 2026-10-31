import {
  addDays,
  clinicNow,
  dateError,
  formatDateLong,
  isTimeInSchedule,
  timeError,
  timesForSlot,
  weekday,
  fromDbDate,
} from "../src/lib/clinic-time";

let fails = 0;
function eq(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`, ok ? "" : `-> ${JSON.stringify(actual)} (esperado ${JSON.stringify(expected)})`);
  if (!ok) fails++;
}

const fridayNight = new Date("2026-10-31T02:44:00.000Z");
eq("clinicNow a las 23:44 de Chile", clinicNow(fridayNight), { date: "2026-10-30", minutes: 23 * 60 + 44 });
eq("hoy sigue siendo 'hoy'", dateError("2026-10-30", fridayNight), null);
eq("ayer ya pasó", dateError("2026-10-29", fridayNight), "Esa fecha ya pasó.");
eq("16:30 de hoy bloqueada por corte", timeError("2026-10-30", "16:30", fridayNight)?.includes("2 horas"), true);
eq("invierno (UTC-4)", clinicNow(new Date("2026-07-01T03:30:00.000Z")), { date: "2026-06-30", minutes: 23 * 60 + 30 });
eq("verano (UTC-3)", clinicNow(new Date("2027-01-15T02:30:00.000Z")), { date: "2027-01-14", minutes: 23 * 60 + 30 });
eq("addDays cruza el año", addDays("2026-12-31", 1), "2027-01-01");
eq("weekday lunes", weekday("2026-11-02"), 1);
eq("fromDbDate", fromDbDate(new Date("2026-11-02T00:00:00.000Z")), "2026-11-02");
eq("último bloque 11:30", timesForSlot({ startTime: "09:00", endTime: "12:00", durationMinutes: 30 }).at(-1), "11:30");
eq("09:15 no está en grilla", isTimeInSchedule("09:15", [{ startTime: "09:00", endTime: "12:00", durationMinutes: 30 }]), false);
eq("formatDateLong", formatDateLong("2026-11-02"), "lunes 2 de noviembre");

console.log(`\n${fails === 0 ? "TODO OK" : fails + " FALLAS"}`);
process.exit(fails === 0 ? 0 : 1);
