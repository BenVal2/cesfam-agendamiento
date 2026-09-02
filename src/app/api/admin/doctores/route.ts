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

  const doctors = await prisma.doctor.findMany({
    include: { availableSlots: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(doctors);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const { name, specialty } = body;

  if (!name) return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });

  const doctor = await prisma.doctor.create({
    data: { name, specialty: specialty || "Medicina General" },
  });

  return NextResponse.json(doctor, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json();
  const { id, name, specialty, active } = body;

  if (!id) return NextResponse.json({ error: "ID es requerido" }, { status: 400 });

  const doctor = await prisma.doctor.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(specialty !== undefined && { specialty }),
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json(doctor);
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID es requerido" }, { status: 400 });

  await prisma.doctor.update({ where: { id }, data: { active: false } });

  return NextResponse.json({ ok: true });
}
