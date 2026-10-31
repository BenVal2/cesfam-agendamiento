import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  clinicNow,
  dateError,
  timeError,
  timesForSlot,
  toDbDate,
  weekday,
} from "@/lib/clinic-time";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: "doctorId y date son requeridos" },
        { status: 400 }
      );
    }

    const blocked = dateError(date);
    if (blocked) {
      return NextResponse.json({ availableTimes: [], note: blocked });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor || !doctor.active) {
      return NextResponse.json(
        { availableTimes: [], note: "El profesional no está disponible." },
        { status: 404 }
      );
    }

    const slots = await prisma.availableSlot.findMany({
      where: { doctorId, dayOfWeek: weekday(date) },
    });

    if (slots.length === 0) {
      return NextResponse.json({
        availableTimes: [],
        note: "El profesional no atiende ese día.",
      });
    }

    const booked = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: toDbDate(date),
        status: "confirmed",
      },
      select: { appointmentTime: true },
    });
    const bookedTimes = new Set(booked.map((b) => b.appointmentTime));

    const allTimes = [...new Set(slots.flatMap(timesForSlot))].sort();
    const availableTimes = allTimes.filter(
      (time) => !bookedTimes.has(time) && !timeError(date, time)
    );

    const isToday = date === clinicNow().date;
    const note =
      availableTimes.length === 0
        ? isToday
          ? "Ya no quedan horas para hoy con este profesional. Elige otra fecha."
          : "No quedan horas disponibles para esta fecha."
        : null;

    return NextResponse.json(
      { availableTimes, note },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error al obtener horas disponibles:", error);
    return NextResponse.json(
      { error: "Error al obtener horas disponibles" },
      { status: 500 }
    );
  }
}
