import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2] || "test@test.com";

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`Usuario ${email} no encontrado`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  console.log(`Usuario ${email} promovido a admin`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
