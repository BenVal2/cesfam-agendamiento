import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendReminder } from "@/lib/email";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "confirmed",
      appointmentDate: { gte: tomorrow, lt: dayAfter },
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
        date: appt.appointmentDate.toISOString().split("T")[0],
        time: appt.appointmentTime,
      });
      sent++;
    } catch (e) {
      errors.push(`${appt.id}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  return NextResponse.json({ sent, errors, total: appointments.length });
}
