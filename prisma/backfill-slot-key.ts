import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const pending = await prisma.appointment.findMany({
    where: { status: "confirmed", slotKey: null },
    select: { id: true, doctorId: true, appointmentDate: true, appointmentTime: true },
  });
  let updated = 0;
  for (const appointment of pending) {
    const date = appointment.appointmentDate.toISOString().slice(0, 10);
    try {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { slotKey: `${appointment.doctorId}|${date}|${appointment.appointmentTime}` },
      });
      updated++;
    } catch (error) {
      console.warn(`No se pudo actualizar ${appointment.id}:`, error instanceof Error ? error.message : error);
    }
  }
  console.log(`${updated}/${pending.length} citas actualizadas con slotKey.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
