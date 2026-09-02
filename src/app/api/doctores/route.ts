import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { active: true },
      include: {
        availableSlots: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Error al obtener doctores:", error);
    return NextResponse.json(
      { error: "Error al obtener doctores" },
      { status: 500 }
    );
  }
}
