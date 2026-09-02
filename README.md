# CESFAM - Agendamiento de Horas Médicas

Aplicación web full-stack de agendamiento de horas médicas para centros de salud familiar. Los pacientes se registran, eligen médico, seleccionan fecha y hora de sus consultas y reciben confirmación por email. Un panel administrativo permite gestionar doctores y horarios.

Proyecto de portafolio — creado como una propuesta real de sistema de agendamiento. Los datos de contacto son de ejemplo (neutralizados).

## Demo

**URL de producción:** https://cesfam-agendamiento.vercel.app

**Cuenta demo:** correo `demo@cesfam.cl` · contraseña `demo1234`

> La demo corre sobre PostgreSQL real en Neon. Cualquier cita que agendes quedará visible en "Mis Citas".

## Características

- **Registro e inicio de sesión** con contraseña segura (bcrypt) y sesiones JWT (NextAuth).
- **Agendamiento en 3 pasos**: elige médico → selecciona fecha en calendario interactivo → elige hora disponible.
- **Prevención de doble agendamiento**: un slot (médico + fecha + hora) solo puede ser reservado por un paciente (restricción única en base de datos + verificación en la API).
- **Mis Citas**: consulta tus citas futuras y cancélalas con confirmación.
- **Panel Admin**: estadísticas, alta/baja de doctores y configuración de horarios por médico.
- **Emails automáticos** (Resend): confirmación al agendar, aviso al cancelar y recordatorio diario (cron).
- **Seguridad**: todas las operaciones sobre citas validan que el paciente autenticado es el dueño del recurso.

## Stack Técnico

| Componente | Tecnología |
|------------|------------|
| Frontend/Backend | Next.js 16 (App Router, React 19) |
| Base de datos | PostgreSQL (Prisma 7 + driver adapter) |
| Autenticación | NextAuth.js 5 (Credentials + JWT) |
| Estilos | Tailwind CSS 4 |
| Emails | Resend (confirmación, cancelación, recordatorios) |
| TypeScript | Sí, en todo el proyecto |

## Estructura

```
src/
├── app/
│   ├── page.tsx               # Landing + datos del centro
│   ├── agendar/               # Wizard de agendamiento (3 pasos)
│   ├── mis-citas/             # Citas del paciente + cancelación
│   ├── login/ y registro/     # Autenticación
│   ├── admin/                 # Panel de administración
│   └── api/                   # Rutas API (citas, doctores, auth, cron)
├── components/                # AgendarContent, MisCitasContent, AdminContent, Navbar
└── lib/
    ├── auth.ts                # Configuración NextAuth
    ├── db.ts                  # Cliente Prisma (singleton)
    └── email.ts               # Plantillas de email (Resend)
prisma/
├── schema.prisma              # User, Doctor, AvailableSlot, Appointment
└── seed.ts                    # 3 doctores de ejemplo con horarios
```

## Inicio Rápido

Requisitos: Node.js 20+, PostgreSQL.

```bash
npm install

cp .env.example .env
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL (+ opcional RESEND_API_KEY y APP_URL)

npx prisma db push      # Crear tablas
npx prisma db seed      # Datos de ejemplo (3 doctores con horarios)

npm run dev
```

### Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `NEXTAUTH_SECRET` | Secreto de sesión (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL de la app (`http://localhost:3000`) |
| `RESEND_API_KEY` | (Opcional) API key de Resend para emails |
| `APP_URL` | (Opcional) Dominio público usado en los links de los emails |

## Scripts

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm start            # Producción
npx prisma studio    # GUI de la base de datos
npx tsx prisma/make-admin.ts tu@email.com   # Promover usuario a admin
```

## Modelo de Datos

- **User**: pacientes (role `user`/`admin`).
- **Doctor**: médicos con especialidad y estado activo.
- **AvailableSlot**: franjas de atención por día de la semana y hora.
- **Appointment**: citas, con restricción única por doctor+fecha+hora y estados `confirmed`/`cancelled`.

### Datos de ejemplo (seed)

- 3 doctores: Dr. Juan Pérez, Dra. María García, Dr. Carlos López.
- Horarios L-V de 9:00–12:00 y 14:00–17:00 en bloques de 30 min.

## Repo

https://github.com/BenVal2/cesfam-agendamiento