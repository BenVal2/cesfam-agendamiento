import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    const dateObj = new Date(date + "T12:00:00");
    const dayOfWeek = dateObj.getDay();

    const slots = await prisma.availableSlot.findMany({
      where: { doctorId, dayOfWeek },
    });

    const booked = await prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: dateObj,
        status: "confirmed",
      },
      select: { appointmentTime: true },
    });

    const bookedTimes = new Set(booked.map((b) => b.appointmentTime));

    const availableTimes: string[] = [];

    for (const slot of slots) {
      const [startHour, startMin] = slot.startTime.split(":").map(Number);
      const [endHour, endMin] = slot.endTime.split(":").map(Number);

      let currentMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      while (currentMinutes + slot.durationMinutes <= endMinutes) {
        const h = Math.floor(currentMinutes / 60)
          .toString()
          .padStart(2, "0");
        const m = (currentMinutes % 60).toString().padStart(2, "0");
        const time = `${h}:${m}`;

        if (!bookedTimes.has(time)) {
          availableTimes.push(time);
        }

        currentMinutes += slot.durationMinutes;
      }
    }

    return NextResponse.json({ availableTimes });
  } catch (error) {
    console.error("Error al obtener horas disponibles:", error);
    return NextResponse.json(
      { error: "Error al obtener horas disponibles" },
      { status: 500 }
    );
  }
}
