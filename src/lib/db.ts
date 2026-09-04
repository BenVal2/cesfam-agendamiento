import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

export interface MockUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockDoctor {
  id: string;
  name: string;
  specialty: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockAvailableSlot {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockAppointment {
  id: string;
  userId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DoctorCreateInput {
  name: string;
  specialty?: string;
  active?: boolean;
  availableSlots?: {
    create: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      durationMinutes?: number;
    }>;
  };
}

interface DoctorWithSlots extends MockDoctor {
  availableSlots?: MockAvailableSlot[];
}

interface SlotWithDoctor extends MockAvailableSlot {
  doctor?: { id: string; name: string } | null;
}

interface AppointmentWithRelations extends MockAppointment {
  doctor?: MockDoctor | null;
  user?: MockUser | { email: string; name: string } | null;
}

class InMemoryDatabase {
  users: MockUser[] = [];
  doctors: MockDoctor[] = [];
  availableSlots: MockAvailableSlot[] = [];
  appointments: MockAppointment[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Doctors
    this.doctors = [
      {
        id: "doc-1",
        name: "Dr. Juan Pérez",
        specialty: "Medicina General",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "doc-2",
        name: "Dra. María García",
        specialty: "Medicina General",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "doc-3",
        name: "Dr. Carlos López",
        specialty: "Medicina General",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Slots (Mon-Fri = 1-5, 09:00-12:00 and 14:00-17:00)
    let slotId = 1;
    for (const doc of this.doctors) {
      for (let day = 1; day <= 5; day++) {
        this.availableSlots.push({
          id: `slot-${slotId++}`,
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "12:00",
          durationMinutes: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        this.availableSlots.push({
          id: `slot-${slotId++}`,
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: "14:00",
          endTime: "17:00",
          durationMinutes: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Default accounts
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    this.users = [
      {
        id: "user-admin-1",
        email: "admin@cesfam.cl",
        name: "Administrador CESFAM",
        phone: "+56 9 1234 5678",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "user-patient-1",
        email: "paciente@cesfam.cl",
        name: "Paciente de Prueba",
        phone: "+56 9 8765 4321",
        password: hashedPassword,
        role: "patient",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private toDateKey(d: Date | string | unknown): string {
    if (d instanceof Date) return d.toISOString().split("T")[0];
    return String(d).split("T")[0];
  }

  // USER operations
  user = {
    findUnique: async (args: { where: { email?: string; id?: string }; select?: Record<string, boolean> }) => {
      const u = this.users.find(
        (user) =>
          (args.where.email && user.email.toLowerCase() === args.where.email.toLowerCase()) ||
          (args.where.id && user.id === args.where.id)
      );
      if (!u) return null;
      if (args.select) {
        const filtered: Record<string, unknown> = {};
        const userRec = u as unknown as Record<string, unknown>;
        for (const k of Object.keys(args.select)) {
          if (args.select[k]) filtered[k] = userRec[k];
        }
        return filtered;
      }
      return { ...u };
    },
    findFirst: async (args?: { where?: Partial<MockUser> }) => {
      const u = this.users.find((user) => {
        if (!args?.where) return true;
        const userRec = user as unknown as Record<string, unknown>;
        for (const [k, v] of Object.entries(args.where)) {
          if (userRec[k] !== v) return false;
        }
        return true;
      });
      return u ? { ...u } : null;
    },
    create: async (args: { data: Omit<MockUser, "id" | "createdAt" | "updatedAt" | "role"> & { role?: string } }) => {
      const newUser: MockUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: args.data.name,
        email: args.data.email,
        password: args.data.password,
        phone: args.data.phone || null,
        role: args.data.role || "patient",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.push(newUser);
      return { ...newUser };
    },
    update: async (args: { where: { email?: string; id?: string }; data: Partial<MockUser> }) => {
      const idx = this.users.findIndex(
        (u) =>
          (args.where.email && u.email.toLowerCase() === args.where.email.toLowerCase()) ||
          (args.where.id && u.id === args.where.id)
      );
      if (idx === -1) throw new Error("User not found");
      this.users[idx] = { ...this.users[idx], ...args.data, updatedAt: new Date() };
      return { ...this.users[idx] };
    },
    count: async (args?: { where?: { role?: string } }) => {
      if (!args?.where?.role) return this.users.length;
      return this.users.filter((u) => u.role === args.where?.role).length;
    },
  };

  // DOCTOR operations
  doctor = {
    findMany: async (args?: {
      where?: { active?: boolean };
      include?: { availableSlots?: boolean | { orderBy?: unknown } };
      orderBy?: { name?: "asc" | "desc" } | unknown;
      select?: Record<string, boolean>;
    }) => {
      let docs = this.doctors.filter((d) => {
        if (args?.where?.active !== undefined && d.active !== args.where.active) return false;
        return true;
      });

      const orderByName = (args?.orderBy as { name?: "asc" | "desc" } | undefined)?.name;
      if (orderByName === "asc") {
        docs = [...docs].sort((a, b) => a.name.localeCompare(b.name));
      }

      if (args?.select) {
        return docs.map((d) => {
          const res: Record<string, unknown> = {};
          const docRec = d as unknown as Record<string, unknown>;
          for (const k of Object.keys(args.select!)) {
            if (args.select![k]) res[k] = docRec[k];
          }
          return res;
        });
      }

      return docs.map((d) => {
        const copy: DoctorWithSlots = { ...d };
        if (args?.include?.availableSlots) {
          copy.availableSlots = this.availableSlots
            .filter((s) => s.doctorId === d.id)
            .sort((a, b) => (a.dayOfWeek !== b.dayOfWeek ? a.dayOfWeek - b.dayOfWeek : a.startTime.localeCompare(b.startTime)));
        }
        return copy;
      });
    },
    findUnique: async (args: { where: { id: string } }) => {
      const doc = this.doctors.find((d) => d.id === args.where.id);
      return doc ? { ...doc } : null;
    },
    create: async (args: { data: DoctorCreateInput }) => {
      const newDoc: MockDoctor = {
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: args.data.name,
        specialty: args.data.specialty || "Medicina General",
        active: args.data.active !== undefined ? args.data.active : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.doctors.push(newDoc);
      if (args.data.availableSlots?.create) {
        for (const slot of args.data.availableSlots.create) {
          this.availableSlots.push({
            id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            doctorId: newDoc.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            durationMinutes: slot.durationMinutes || 30,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      return { ...newDoc };
    },
    update: async (args: { where: { id: string }; data: Partial<MockDoctor> }) => {
      const idx = this.doctors.findIndex((d) => d.id === args.where.id);
      if (idx === -1) throw new Error("Doctor not found");
      this.doctors[idx] = { ...this.doctors[idx], ...args.data, updatedAt: new Date() };
      return { ...this.doctors[idx] };
    },
  };

  // AVAILABLE SLOT operations
  availableSlot = {
    findMany: async (args?: {
      where?: { doctorId?: string; dayOfWeek?: number };
      include?: { doctor?: boolean | { select?: Record<string, boolean> } };
      orderBy?: unknown;
    }) => {
      let slots = this.availableSlots.filter((s) => {
        if (args?.where?.doctorId && s.doctorId !== args.where.doctorId) return false;
        if (args?.where?.dayOfWeek !== undefined && s.dayOfWeek !== args.where.dayOfWeek) return false;
        return true;
      });

      slots = [...slots].sort((a, b) =>
        a.dayOfWeek !== b.dayOfWeek ? a.dayOfWeek - b.dayOfWeek : a.startTime.localeCompare(b.startTime)
      );

      return slots.map((s) => {
        const copy: SlotWithDoctor = { ...s };
        if (args?.include?.doctor) {
          const doc = this.doctors.find((d) => d.id === s.doctorId);
          copy.doctor = doc ? { id: doc.id, name: doc.name } : null;
        }
        return copy;
      });
    },
    findUnique: async (args: {
      where: { id?: string; doctorId_dayOfWeek_startTime?: { doctorId: string; dayOfWeek: number; startTime: string } };
    }) => {
      if (args.where.id) {
        const slot = this.availableSlots.find((s) => s.id === args.where.id);
        return slot ? { ...slot } : null;
      }
      if (args.where.doctorId_dayOfWeek_startTime) {
        const { doctorId, dayOfWeek, startTime } = args.where.doctorId_dayOfWeek_startTime;
        const slot = this.availableSlots.find(
          (s) => s.doctorId === doctorId && s.dayOfWeek === dayOfWeek && s.startTime === startTime
        );
        return slot ? { ...slot } : null;
      }
      return null;
    },
    create: async (args: {
      data: { doctorId: string; dayOfWeek: number; startTime: string; endTime: string; durationMinutes?: number };
    }) => {
      const slot: MockAvailableSlot = {
        id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        doctorId: args.data.doctorId,
        dayOfWeek: args.data.dayOfWeek,
        startTime: args.data.startTime,
        endTime: args.data.endTime,
        durationMinutes: args.data.durationMinutes || 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.availableSlots.push(slot);
      return { ...slot };
    },
    update: async (args: { where: { id: string }; data: Partial<MockAvailableSlot> }) => {
      const idx = this.availableSlots.findIndex((s) => s.id === args.where.id);
      if (idx === -1) throw new Error("Slot not found");
      this.availableSlots[idx] = { ...this.availableSlots[idx], ...args.data, updatedAt: new Date() };
      return { ...this.availableSlots[idx] };
    },
    delete: async (args: { where: { id: string } }) => {
      const idx = this.availableSlots.findIndex((s) => s.id === args.where.id);
      if (idx !== -1) {
        const removed = this.availableSlots.splice(idx, 1)[0];
        return { ...removed };
      }
      return { id: args.where.id };
    },
  };

  // APPOINTMENT operations
  appointment = {
    findFirst: async (args: {
      where: {
        doctorId?: string;
        appointmentDate?: Date | string;
        appointmentTime?: string;
        status?: string;
      };
    }) => {
      const appt = this.appointments.find((a) => {
        if (args.where.doctorId && a.doctorId !== args.where.doctorId) return false;
        if (args.where.appointmentTime && a.appointmentTime !== args.where.appointmentTime) return false;
        if (args.where.status && a.status !== args.where.status) return false;
        if (args.where.appointmentDate) {
          if (this.toDateKey(a.appointmentDate) !== this.toDateKey(args.where.appointmentDate)) return false;
        }
        return true;
      });
      return appt ? { ...appt } : null;
    },
    findUnique: async (args: { where: { id: string }; select?: Record<string, unknown> }) => {
      const appt = this.appointments.find((a) => a.id === args.where.id);
      if (!appt) return null;
      if (args.select) {
        const res: Record<string, unknown> = {};
        const apptRec = appt as unknown as Record<string, unknown>;
        for (const k of Object.keys(args.select)) {
          if (k === "user" && args.select.user) {
            const u = this.users.find((user) => user.id === appt.userId);
            res.user = u ? { email: u.email, name: u.name } : null;
          } else if (args.select[k]) {
            res[k] = apptRec[k];
          }
        }
        return res;
      }
      return { ...appt };
    },
    findMany: async (args?: {
      where?: {
        userId?: string;
        doctorId?: string;
        status?: string;
        appointmentDate?: Date | string | { gte?: Date | string; lt?: Date | string };
      };
      include?: { doctor?: boolean; user?: boolean };
      orderBy?: unknown;
      select?: Record<string, boolean>;
      take?: number;
    }) => {
      let list = this.appointments.filter((a) => {
        if (args?.where?.userId && a.userId !== args.where.userId) return false;
        if (args?.where?.doctorId && a.doctorId !== args.where.doctorId) return false;
        if (args?.where?.status && a.status !== args.where.status) return false;
        if (args?.where?.appointmentDate) {
          const ad = args.where.appointmentDate;
          if (ad instanceof Date || typeof ad === "string") {
            if (this.toDateKey(a.appointmentDate) !== this.toDateKey(ad)) return false;
          } else if (typeof ad === "object" && ad !== null) {
            const time = new Date(a.appointmentDate).getTime();
            if (ad.gte && time < new Date(ad.gte).getTime()) return false;
            if (ad.lt && time >= new Date(ad.lt).getTime()) return false;
          }
        }
        return true;
      });

      // Sort
      list = [...list].sort((a, b) => {
        const timeA = new Date(a.appointmentDate).getTime();
        const timeB = new Date(b.appointmentDate).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return a.appointmentTime.localeCompare(b.appointmentTime);
      });

      if (args?.take) {
        list = list.slice(0, args.take);
      }

      if (args?.select) {
        return list.map((a) => {
          const res: Record<string, unknown> = {};
          const apptRec = a as unknown as Record<string, unknown>;
          for (const k of Object.keys(args.select!)) {
            if (args.select![k]) res[k] = apptRec[k];
          }
          return res;
        });
      }

      return list.map((a) => {
        const copy: AppointmentWithRelations = { ...a };
        if (args?.include?.doctor) {
          copy.doctor = this.doctors.find((d) => d.id === a.doctorId) || null;
        }
        if (args?.include?.user) {
          copy.user = this.users.find((u) => u.id === a.userId) || null;
        }
        return copy;
      });
    },
    create: async (args: {
      data: { userId: string; doctorId: string; appointmentDate: Date; appointmentTime: string };
      include?: { doctor?: boolean };
    }) => {
      const appt: MockAppointment = {
        id: `appt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userId: args.data.userId,
        doctorId: args.data.doctorId,
        appointmentDate: args.data.appointmentDate,
        appointmentTime: args.data.appointmentTime,
        status: "confirmed",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.appointments.push(appt);
      const copy: AppointmentWithRelations = { ...appt };
      if (args.include?.doctor) {
        copy.doctor = this.doctors.find((d) => d.id === appt.doctorId) || null;
      }
      return copy;
    },
    update: async (args: { where: { id: string }; data: Partial<MockAppointment>; include?: { doctor?: boolean } }) => {
      const idx = this.appointments.findIndex((a) => a.id === args.where.id);
      if (idx === -1) throw new Error("Appointment not found");
      this.appointments[idx] = { ...this.appointments[idx], ...args.data, updatedAt: new Date() };
      const copy: AppointmentWithRelations = { ...this.appointments[idx] };
      if (args.include?.doctor) {
        copy.doctor = this.doctors.find((d) => d.id === copy.doctorId) || null;
      }
      return copy;
    },
    count: async (args?: { where?: { status?: string; appointmentDate?: Date | string | { gte?: Date | string; lt?: Date | string }; role?: string; userId?: string; doctorId?: string } }) => {
      if (!args?.where) return this.appointments.length;
      return (await this.appointment.findMany({ where: args.where })).length;
    },
    groupBy: async (args: {
      by: ("doctorId" | "appointmentDate")[];
      where?: { status?: string; appointmentDate?: Date | string | { gte?: Date | string; lt?: Date | string }; doctorId?: string };
      _count?: boolean;
    }) => {
      const matching = (await this.appointment.findMany({ where: args.where })) as AppointmentWithRelations[];
      const byKey = args.by[0];
      const groups = new Map<string, { keyVal: string | Date; count: number }>();

      for (const item of matching) {
        let key = "";
        let val: string | Date = "";
        if (byKey === "doctorId") {
          key = item.doctorId;
          val = item.doctorId;
        } else if (byKey === "appointmentDate") {
          key = this.toDateKey(item.appointmentDate);
          val = new Date(key + "T12:00:00");
        }
        const existing = groups.get(key) || { keyVal: val, count: 0 };
        existing.count += 1;
        groups.set(key, existing);
      }

      const results: Array<Record<string, unknown>> = [];
      for (const [, grp] of groups) {
        results.push({
          [byKey]: grp.keyVal,
          _count: grp.count,
        });
      }
      return results;
    },
  };

  $disconnect = async () => {};
}

// Global store to persist across Next.js dev reloads
const globalStore = globalThis as unknown as {
  __cesfamStore?: InMemoryDatabase;
  __prismaClient?: unknown;
};

if (!globalStore.__cesfamStore) {
  globalStore.__cesfamStore = new InMemoryDatabase();
}
const mockDb = globalStore.__cesfamStore;

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[AI Studio] DATABASE_URL not set — using in-memory database with pre-seeded doctors and accounts");
    return mockDb;
  }

  try {
    const adapter = new PrismaPg({ connectionString });
    const realPrisma = new PrismaClient({ adapter });

    // Proxy with fallback to mockDb on query failure
    return new Proxy(realPrisma, {
      get(target, prop, receiver) {
        const orig = Reflect.get(target, prop, receiver);
        if (typeof prop === "string" && (prop in mockDb)) {
          const mockModel = (mockDb as unknown as Record<string, Record<string, (...args: unknown[]) => unknown>>)[prop];
          if (orig && typeof orig === "object") {
            return new Proxy(orig, {
              get(modelTarget, modelProp) {
                const modelOrig = Reflect.get(modelTarget, modelProp);
                if (typeof modelOrig === "function") {
                  return async (...callArgs: unknown[]) => {
                    try {
                      return await modelOrig.apply(modelTarget, callArgs);
                    } catch (err) {
                      console.warn(`[AI Studio] Database call ${prop}.${String(modelProp)} failed, falling back to in-memory store:`, err);
                      if (mockModel && typeof mockModel[String(modelProp)] === "function") {
                        return await mockModel[String(modelProp)](...callArgs);
                      }
                      throw err;
                    }
                  };
                }
                return modelOrig;
              },
            });
          }
        }
        return orig;
      },
    });
  } catch (err) {
    console.warn("[AI Studio] Error connecting to Prisma, using in-memory database:", err);
    return mockDb;
  }
}

export const prisma = (globalStore.__prismaClient ??= createClient()) as unknown as PrismaClient;
