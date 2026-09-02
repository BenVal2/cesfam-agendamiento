import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as Record<string, unknown>).role !== "admin") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const slots = await prisma.availableSlot.findMany({
    include: { doctor: { select: { id: true, name: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(slots);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const { doctorId, dayOfWeek, startTime, endTime, durationMinutes } = body;

  if (!doctorId || dayOfWeek === undefined || !startTime || !endTime) {
    return NextResponse.json({ error: "doctorId, dayOfWeek, startTime y endTime son requeridos" }, { status: 400 });
  }

  const existing = await prisma.availableSlot.findUnique({
    where: { doctorId_dayOfWeek_startTime: { doctorId, dayOfWeek, startTime } },
  });

  if (existing) {
    return NextResponse.json({ error: "Este horario ya existe para este médico" }, { status: 409 });
  }

  const slot = await prisma.availableSlot.create({
    data: {
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      durationMinutes: durationMinutes || 30,
    },
  });

  return NextResponse.json(slot, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const { id, startTime, endTime, durationMinutes } = body;

  if (!id) return NextResponse.json({ error: "ID es requerido" }, { status: 400 });

  const slot = await prisma.availableSlot.update({
    where: { id },
    data: {
      ...(startTime !== undefined && { startTime }),
      ...(endTime !== undefined && { endTime }),
      ...(durationMinutes !== undefined && { durationMinutes }),
    },
  });

  return NextResponse.json(slot);
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID es requerido" }, { status: 400 });

  await prisma.availableSlot.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
