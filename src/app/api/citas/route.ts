import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendBookingConfirmation, sendBookingCancellation } from "@/lib/email";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return session;
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

    const appointmentDate = new Date(date + "T12:00:00");

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email,
          password: "oauth-pending",
        },
      });
    }

    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate,
        appointmentTime: time,
        status: "confirmed",
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Esta hora ya fue agendada por otro paciente" },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        doctorId,
        appointmentDate,
        appointmentTime: time,
      },
      include: {
        doctor: true,
      },
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
    console.error("Error al crear cita:", error);
    return NextResponse.json(
      { error: "Error al crear la cita" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await requireUser();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,
        status: "confirmed",
        appointmentDate: { gte: new Date() },
      },
      include: { doctor: true },
      orderBy: { appointmentDate: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return NextResponse.json(
      { error: "Error al obtener citas" },
      { status: 500 }
    );
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

    if (!id) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { id: true, user: { select: { email: true } } },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    if (appointment.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "No puedes cancelar una cita que no te pertenece" },
        { status: 403 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "cancelled" },
      include: { doctor: true },
    });

    if (process.env.RESEND_API_KEY && appointment.user.email) {
      sendBookingCancellation({
        to: appointment.user.email,
        patientName: session.user.name || appointment.user.email,
        doctorName: updated.doctor.name,
        date: updated.appointmentDate.toISOString().split("T")[0],
        time: updated.appointmentTime,
      }).catch((e) => console.error("Error enviando email cancelación:", e));
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    return NextResponse.json(
      { error: "Error al cancelar la cita" },
      { status: 500 }
    );
  }
}