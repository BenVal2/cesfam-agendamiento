export type Role = "patient" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  active: boolean;
  availableSlots?: Slot[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Slot {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  doctor?: {
    id: string;
    name: string;
  } | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type AppointmentStatus = "confirmed" | "cancelled" | "completed";

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  doctor: {
    id?: string;
    name: string;
    specialty: string;
  };
  user?: {
    id?: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AdminStats {
  totalAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
  weekAppointments: number;
  monthAppointments: number;
  totalPatients: number;
  appointmentsByDoctor: {
    doctor: {
      id: string;
      name: string;
      specialty: string;
    };
    count: number;
  }[];
  appointmentsByDay: {
    date: string;
    count: number;
  }[];
  recentAppointments: {
    id: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    doctor: {
      name: string;
      specialty: string;
    };
    user: {
      name: string;
      email: string;
    };
  }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
