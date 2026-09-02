import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const doctors = [
    { name: 'Dr. Juan Pérez', specialty: 'Medicina General' },
    { name: 'Dra. María García', specialty: 'Medicina General' },
    { name: 'Dr. Carlos López', specialty: 'Medicina General' }
  ]

  for (const doctor of doctors) {
    await prisma.doctor.create({
      data: {
        ...doctor,
        availableSlots: {
          create: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', durationMinutes: 30 },
            { dayOfWeek: 1, startTime: '14:00', endTime: '17:00', durationMinutes: 30 },
            { dayOfWeek: 2, startTime: '09:00', endTime: '12:00', durationMinutes: 30 },
            { dayOfWeek: 2, startTime: '14:00', endTime: '17:00', durationMinutes: 30 },
            { dayOfWeek: 3, startTime: '09:00', endTime: '12:00', durationMinutes: 30 },
            { dayOfWeek: 3, startTime: '14:00', endTime: '17:00', durationMinutes: 30 },
            { dayOfWeek: 4, startTime: '09:00', endTime: '12:00', durationMinutes: 30 },
            { dayOfWeek: 4, startTime: '14:00', endTime: '17:00', durationMinutes: 30 },
            { dayOfWeek: 5, startTime: '09:00', endTime: '12:00', durationMinutes: 30 },
            { dayOfWeek: 5, startTime: '14:00', endTime: '17:00', durationMinutes: 30 }
          ]
        }
      }
    })
  }

  console.log('Datos iniciales creados')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
