export const DAY_NAMES_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

export const DAY_NAMES_FULL = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Atendida",
};

export const CLINIC_INFO = {
  name: "CESFAM",
  fullName: "Centro de Salud Familiar",
  phone: "+56 9 0000 0000",
  email: "contacto@cesfam.cl",
  address: "Dirección del centro de salud, Comuna, Santiago",
  schedule: "Lunes a viernes, 9:00 - 12:00 / 14:00 - 17:00",
};
