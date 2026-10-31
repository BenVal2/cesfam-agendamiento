import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendReminder } from "@/lib/email";
import { addDays, clinicNow, fromDbDate, toDbDate } from "@/lib/clinic-time";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date: today } = clinicNow();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(tomorrow, 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "confirmed",
      appointmentDate: { gte: toDbDate(tomorrow), lt: toDbDate(dayAfter) },
    },
    include: { doctor: true, user: true },
  });

  if (appointments.length === 0) {
    return NextResponse.json({ sent: 0, message: "No hay citas mañana" });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const appt of appointments) {
    if (!appt.user.email) continue;
    try {
      await sendReminder({
        to: appt.user.email,
        patientName: appt.user.name,
        doctorName: appt.doctor.name,
        date: fromDbDate(appt.appointmentDate),
        time: appt.appointmentTime,
      });
      sent++;
    } catch (e) {
      errors.push(`${appt.id}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  return NextResponse.json({ sent, errors, total: appointments.length });
}
