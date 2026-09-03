import Link from "next/link";

export default function HomePage() {
  return (
    <div className="w-full space-y-16 sm:space-y-24 py-8">
      {/* Hero */}
      <section className="w-full mx-auto relative rounded-[var(--radius-2xl)] p-6 sm:p-10 lg:p-14 text-center overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true"></span>
            Atención primaria en línea
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-fg leading-[1.15]">
            Agenda tu hora médica
            <span className="gradient-text block mt-1">sin filas, sin llamadas</span>
          </h1>
          <p className="text-lg text-fg-secondary max-w-xl mx-auto leading-relaxed">
            Reserva tu consulta con los médicos generales de tu centro de salud familiar de forma rápida y sencilla.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/agendar"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-md hover:bg-primary-hover hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all min-h-[48px]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              Agendar ahora
            </Link>
            <Link
              href="/mis-citas"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-card-border bg-card/80 px-7 py-3.5 text-base font-semibold text-fg shadow-sm hover:bg-card-hover hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all min-h-[48px]"
            >
              Ver mis citas
            </Link>
          </div>
        </div>
        {/* Decorative gradient blobs */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" aria-hidden="true" />
      </section>

      {/* ¿Cómo funciona? */}
      <section aria-labelledby="como-funciona" className="w-full mx-auto">
        <h2 id="como-funciona" className="text-2xl sm:text-3xl font-bold text-fg mb-8 text-center">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          <StepCard
            step="1"
            title="Elige tu médico"
            description="Revisa los médicos disponibles y elige quién atenderá tu consulta."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            }
          />
          <StepCard
            step="2"
            title="Selecciona fecha y hora"
            description="Elige el día y la hora que mejor se adapte a tu horario. Solo mostramos las horas disponibles."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            }
          />
          <StepCard
            step="3"
            title="Confirma tu cita"
            description="Recibe confirmación instantánea. Puedes ver o cancelar tus citas en cualquier momento."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Datos del CESFAM */}
      <section aria-labelledby="datos-cesfam" className="w-full mx-auto glass-card rounded-[var(--radius-2xl)] p-5 sm:p-8 lg:p-10">
        <h2 id="datos-cesfam" className="text-2xl font-bold text-fg mb-6">
          Centro de Salud Familiar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 text-sm">
          <div className="space-y-4">
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>}
              label="Dirección"
              value="[Dirección del centro de salud], Comuna, Santiago"
            />
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>}
              label="Teléfono"
              value="+56 9 0000 0000"
            />
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>}
              label="Email"
              value={<a href="mailto:contacto@cesfam.cl" className="text-primary hover:underline">contacto@cesfam.cl</a>}
            />
          </div>
          <div className="space-y-4">
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
              label="Horario de atención"
              value="Lunes a viernes, 9:00 - 12:00 / 14:00 - 17:00"
            />
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>}
              label="Población"
              value="+25.000 personas en la comuna"
            />
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>}
              label="Convenio"
              value="Servicio de Salud Metropolitano Norte (desde 1993)"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({ step, title, description, icon }: { step: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <article className="glass-card rounded-[var(--radius-xl)] p-6 relative overflow-hidden">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary-soft text-primary" aria-hidden="true">
          {icon}
        </span>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1 block">Paso {step}</span>
          <h3 className="font-semibold text-fg text-lg leading-snug">{title}</h3>
          <p className="text-sm text-fg-secondary mt-1.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </article>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-primary mt-0.5 shrink-0" aria-hidden="true">{icon}</span>
      <div>
        <p className="font-medium text-fg">{label}</p>
        <p className="text-fg-secondary">{value}</p>
      </div>
    </div>
  );
}
