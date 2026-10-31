import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addDays, clinicNow, fromDbDate, toDbDate } from "@/lib/clinic-time";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as Record<string, unknown>).role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { date: today } = clinicNow();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);
  const [year, month] = today.split("-").map(Number);
  const thisMonth = `${today.slice(0, 7)}-01`;
  const nextMonth = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);

  const [
    totalAppointments,
    confirmedAppointments,
    cancelledAppointments,
    todayAppointments,
    weekAppointments,
    monthAppointments,
    totalPatients,
    appointmentsByDoctor,
    appointmentsByDay,
    recentAppointments,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "confirmed" } }),
    prisma.appointment.count({ where: { status: "cancelled" } }),
    prisma.appointment.count({ where: { status: "confirmed", appointmentDate: { gte: toDbDate(today), lt: toDbDate(tomorrow) } } }),
    prisma.appointment.count({ where: { status: "confirmed", appointmentDate: { gte: toDbDate(today), lt: toDbDate(nextWeek) } } }),
    prisma.appointment.count({ where: { status: "confirmed", appointmentDate: { gte: toDbDate(thisMonth), lt: toDbDate(nextMonth) } } }),
    prisma.user.count({ where: { role: "patient" } }),
    prisma.appointment.groupBy({ by: ["doctorId"], where: { status: "confirmed" }, _count: true }),
    prisma.appointment.groupBy({ by: ["appointmentDate"], where: { status: "confirmed", appointmentDate: { gte: toDbDate(today), lt: toDbDate(nextWeek) } }, _count: true }),
    prisma.appointment.findMany({ where: { status: "confirmed", appointmentDate: { gte: toDbDate(today) } }, include: { doctor: true, user: true }, orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }], take: 10 }),
  ]);

  const doctors = await prisma.doctor.findMany({ select: { id: true, name: true, specialty: true } });
  const doctorMap = new Map(doctors.map((d) => [d.id, d]));

  return NextResponse.json({
    totalAppointments,
    confirmedAppointments,
    cancelledAppointments,
    todayAppointments,
    weekAppointments,
    monthAppointments,
    totalPatients,
    appointmentsByDoctor: appointmentsByDoctor.map((item) => ({ doctor: doctorMap.get(item.doctorId), count: item._count })),
    appointmentsByDay: appointmentsByDay.map((item) => ({ date: fromDbDate(item.appointmentDate), count: item._count })),
    recentAppointments,
  });
}
