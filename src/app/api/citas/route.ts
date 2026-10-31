import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendBookingConfirmation, sendBookingCancellation } from "@/lib/email";
import {
  clinicNow,
  dateError,
  fromDbDate,
  isTimeInSchedule,
  MAX_OPEN_APPOINTMENTS,
  minutesOf,
  timeError,
  toDbDate,
  BOOKING_CUTOFF_MINUTES,
  weekday,
} from "@/lib/clinic-time";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return session;
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { doctorId, date, time } = body;

    if (!doctorId || !date || !time) {
      return NextResponse.json(
        { error: "doctorId, date y time son requeridos" },
        { status: 400 }
      );
    }

    const dateRule = dateError(date);
    if (dateRule) return NextResponse.json({ error: dateRule }, { status: 400 });

    const timeRule = timeError(date, time);
    if (timeRule) return NextResponse.json({ error: timeRule }, { status: 400 });

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor || !doctor.active) {
      return NextResponse.json({ error: "El profesional no está disponible." }, { status: 404 });
    }

    const slots = await prisma.availableSlot.findMany({
      where: { doctorId, dayOfWeek: weekday(date) },
    });
    if (!isTimeInSchedule(time, slots)) {
      return NextResponse.json(
        { error: "Esa hora no está dentro del horario de atención del profesional." },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email,
          password: "oauth-pending",
        },
      });
    }

    const today = clinicNow().date;

    const openAppointments = await prisma.appointment.count({
      where: {
        userId: user.id,
        status: "confirmed",
        appointmentDate: { gte: toDbDate(today) },
      },
    });
    if (openAppointments >= MAX_OPEN_APPOINTMENTS) {
      return NextResponse.json(
        { error: `Ya tienes ${MAX_OPEN_APPOINTMENTS} horas agendadas. Cancela una para reservar otra.` },
        { status: 409 }
      );
    }

    const patientOverlap = await prisma.appointment.findFirst({
      where: {
        userId: user.id,
        appointmentDate: toDbDate(date),
        appointmentTime: time,
        status: "confirmed",
      },
    });
    if (patientOverlap) {
      return NextResponse.json({ error: "Ya tienes una hora agendada a esa misma hora." }, { status: 409 });
    }

    const slotTaken = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: toDbDate(date),
        appointmentTime: time,
        status: "confirmed",
      },
    });
    if (slotTaken) {
      return NextResponse.json({ error: "Esta hora ya fue agendada por otro paciente" }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        doctorId,
        appointmentDate: toDbDate(date),
        appointmentTime: time,
        slotKey: `${doctorId}|${date}|${time}`,
      },
      include: { doctor: true },
    });

    if (process.env.RESEND_API_KEY) {
      sendBookingConfirmation({
        to: user.email,
        patientName: user.name,
        doctorName: appointment.doctor.name,
        specialty: appointment.doctor.specialty,
        date,
        time,
      }).catch((e) => console.error("Error enviando email:", e));
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "Esa hora acaba de ser tomada por otro paciente. Elige otra." },
        { status: 409 }
      );
    }
    console.error("Error al crear cita:", error);
    return NextResponse.json({ error: "Error al crear la cita" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await requireUser();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json([]);

    const today = clinicNow().date;

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,
        status: "confirmed",
        appointmentDate: { gte: toDbDate(today) },
      },
      include: { doctor: true },
      orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return NextResponse.json({ error: "Error al obtener citas" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireUser();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, user: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    if (appointment.user.email !== session.user.email) {
      return NextResponse.json({ error: "No puedes cancelar una cita que no te pertenece" }, { status: 403 });
    }

    if (appointment.status !== "confirmed") {
      return NextResponse.json({ error: "Esta cita ya fue cancelada." }, { status: 409 });
    }

    const date = fromDbDate(appointment.appointmentDate);
    const clinic = clinicNow();
    const isToday = date === clinic.date;
    const startsIn = minutesOf(appointment.appointmentTime) - clinic.minutes;

    if (date < clinic.date || (isToday && startsIn < BOOKING_CUTOFF_MINUTES)) {
      return NextResponse.json(
        { error: "Ya no puedes cancelar: faltan menos de 2 horas para la atención. Llama al centro." },
        { status: 409 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "cancelled", slotKey: null },
      include: { doctor: true, user: true },
    });

    if (process.env.RESEND_API_KEY && updated.user.email) {
      sendBookingCancellation({
        to: updated.user.email,
        patientName: updated.user.name,
        doctorName: updated.doctor.name,
        date,
        time: updated.appointmentTime,
      }).catch((e) => console.error("Error enviando email cancelación:", e));
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    return NextResponse.json({ error: "Error al cancelar la cita" }, { status: 500 });
  }
}
