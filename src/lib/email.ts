import { Resend } from "resend";

const FROM = "CESFAM <onboarding@resend.dev>";

const APP_URL = process.env.APP_URL || "https://TU-DOMINIO-EJEMPLO.app";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function formatDate(dateStr: string): string {
  const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const d = new Date(dateStr + "T12:00:00");
  return `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export async function sendBookingConfirmation({
  to,
  patientName,
  doctorName,
  specialty,
  date,
  time,
}: {
  to: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#0d9488;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;">CESFAM</h1>
      <p style="color:#ccfbf1;margin:4px 0 0;font-size:14px;">Confirmación de Cita</p>
    </div>
    <div style="padding:24px;">
      <p style="color:#18181b;font-size:16px;margin:0 0 16px;">Estimado/a <strong>${patientName}</strong>,</p>
      <p style="color:#52525b;font-size:14px;margin:0 0 20px;">Su cita ha sido agendada exitosamente:</p>
      <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:16px;margin-bottom:20px;">
        <table style="width:100%;font-size:14px;color:#18181b;">
          <tr><td style="padding:4px 0;color:#737373;">Doctor</td><td style="padding:4px 0;text-align:right;font-weight:600;">${doctorName}</td></tr>
          <tr><td style="padding:4px 0;color:#737373;">Especialidad</td><td style="padding:4px 0;text-align:right;">${specialty}</td></tr>
          <tr><td style="padding:4px 0;color:#737373;">Fecha</td><td style="padding:4px 0;text-align:right;font-weight:600;">${formatDate(date)}</td></tr>
          <tr><td style="padding:4px 0;color:#737373;">Hora</td><td style="padding:4px 0;text-align:right;font-weight:600;">${time}</td></tr>
        </table>
      </div>
      <p style="color:#52525b;font-size:13px;margin:0 0 8px;">Por favor llegue 10 minutos antes de su hora asignada.</p>
      <p style="color:#52525b;font-size:13px;margin:0 0 20px;">Si necesita cancelar o reprogramar, ingrese a <a href="${APP_URL}/mis-citas" style="color:#0d9488;">Mis Citas</a>.</p>
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:20px 0;">
      <p style="color:#a1a1aa;font-size:12px;margin:0;text-align:center;">CESFAM &bull; [Dirección del centro de salud] &bull; +56 9 0000 0000</p>
    </div>
  </div>
</body>
</html>`;

  const client = getClient();
  if (!client) return null;
  return client.emails.send({ from: FROM, to, subject: "Cita confirmada - CESFAM", html });
}

export async function sendBookingCancellation({
  to,
  patientName,
  doctorName,
  date,
  time,
}: {
  to: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#dc2626;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;">CESFAM</h1>
      <p style="color:#fecaca;margin:4px 0 0;font-size:14px;">Cita Cancelada</p>
    </div>
    <div style="padding:24px;">
      <p style="color:#18181b;font-size:16px;margin:0 0 16px;">Estimado/a <strong>${patientName}</strong>,</p>
      <p style="color:#52525b;font-size:14px;margin:0 0 20px;">Su cita ha sido cancelada:</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:20px;">
        <table style="width:100%;font-size:14px;color:#18181b;">
          <tr><td style="padding:4px 0;color:#737373;">Doctor</td><td style="padding:4px 0;text-align:right;">${doctorName}</td></tr>
          <tr><td style="padding:4px 0;color:#737373;">Fecha</td><td style="padding:4px 0;text-align:right;">${formatDate(date)}</td></tr>
          <tr><td style="padding:4px 0;color:#737373;">Hora</td><td style="padding:4px 0;text-align:right;">${time}</td></tr>
        </table>
      </div>
      <p style="color:#52525b;font-size:13px;margin:0 0 20px;">Si desea agendar una nueva cita, puede hacerlo desde <a href="${APP_URL}/agendar" style="color:#0d9488;">Agendar</a>.</p>
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:20px 0;">
      <p style="color:#a1a1aa;font-size:12px;margin:0;text-align:center;">CESFAM &bull; [Dirección del centro de salud] &bull; +56 9 0000 0000</p>
    </div>
  </div>
</body>
</html>`;

  const client = getClient();
  if (!client) return null;
  return client.emails.send({ from: FROM, to, subject: "Cita cancelada - CESFAM", html });
}

export async function sendReminder({
  to,
  patientName,
  doctorName,
  date,
  time,
}: {
  to: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#f59e0b;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;">CESFAM</h1>
      <p style="color:#fef3c7;margin:4px 0 0;font-size:14px;">Recordatorio de Cita</p>
    </div>
    <div style="padding:24px;">
      <p style="color:#18181b;font-size:16px;margin:0 0 16px;">Estimado/a <strong>${patientName}</strong>,</p>
      <p style="color:#52525b;font-size:14px;margin:0 0 20px;">Le recordamos que tiene una cita programada para mañana:</p>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:20px;">
        <table style="width:100%;font-size:14px;color:#18181b;">
          <tr><td style="padding:4px 0;color:#737373;">Doctor</td><td style="padding:4px 0;text-align:right;font-weight:600;">${doctorName}</td></tr>
          <tr><td style="padding:4px 0;color:#737373;">Fecha</td><td style="padding:4px 0;text-align:right;font-weight:600;">${formatDate(date)}</td></tr>
          <tr><td style="padding:4px 0;color:#737373;">Hora</td><td style="padding:4px 0;text-align:right;font-weight:600;">${time}</td></tr>
        </table>
      </div>
      <p style="color:#52525b;font-size:13px;margin:0 0 8px;">Por favor llegue 10 minutos antes de su hora asignada.</p>
      <p style="color:#52525b;font-size:13px;margin:0 0 20px;">Si no puede asistir, cancele desde <a href="${APP_URL}/mis-citas" style="color:#0d9488;">Mis Citas</a> para liberar el turno.</p>
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:20px 0;">
      <p style="color:#a1a1aa;font-size:12px;margin:0;text-align:center;">CESFAM &bull; [Dirección del centro de salud] &bull; +56 9 0000 0000</p>
    </div>
  </div>
</body>
</html>`;

  const client = getClient();
  if (!client) return null;
  return client.emails.send({ from: FROM, to, subject: "Recordatorio: su cita es mañana - CESFAM", html });
}
