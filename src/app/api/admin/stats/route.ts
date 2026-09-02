import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as Record<string, unknown>).role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

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
    prisma.appointment.count({ where: { status: "confirmed", appointmentDate: { gte: today, lt: tomorrow } } }),
    prisma.appointment.count({ where: { status: "confirmed", appointmentDate: { gte: today, lt: nextWeek } } }),
    prisma.appointment.count({ where: { status: "confirmed", appointmentDate: { gte: thisMonth, lt: nextMonth } } }),
    prisma.user.count({ where: { role: "patient" } }),
    prisma.appointment.groupBy({
      by: ["doctorId"],
      where: { status: "confirmed" },
      _count: true,
    }),
    prisma.appointment.groupBy({
      by: ["appointmentDate"],
      where: { status: "confirmed", appointmentDate: { gte: today, lt: nextWeek } },
      _count: true,
    }),
    prisma.appointment.findMany({
      where: { status: "confirmed" },
      include: { doctor: true, user: true },
      orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
      take: 10,
    }),
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
    appointmentsByDoctor: appointmentsByDoctor.map((item) => ({
      doctor: doctorMap.get(item.doctorId),
      count: item._count,
    })),
    appointmentsByDay: appointmentsByDay.map((item) => ({
      date: item.appointmentDate.toISOString().split("T")[0],
      count: item._count,
    })),
    recentAppointments,
  });
}
