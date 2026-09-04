import Link from "next/link";
import { CLINIC_INFO } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col gap-16 py-8 sm:gap-24">
      {/* Hero */}
      <section
        id="hero-section"
        className="w-full mx-auto relative overflow-hidden rounded-[var(--radius-2xl)] px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 text-center"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <span className="inline-flex items-center justify-center gap-2 rounded-full bg-card/80 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-primary ring-1 ring-primary/20 mx-auto text-center">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" aria-hidden="true" />
            Atención de lunes a viernes &bull; Sin filas ni esperas
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-fg leading-[1.15] text-center">
            Agenda tu hora médica
            <span className="gradient-text block mt-1">en menos de 1 minuto</span>
          </h1>

          <p className="text-lg text-fg-secondary max-w-xl mx-auto leading-relaxed text-center self-center">
            Reserva tu consulta con los profesionales de tu centro de salud familiar, de forma rápida, segura y disponible 24/7.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/agendar"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-md hover:bg-primary-hover hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all min-h-[48px]"
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

          <dl className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-xl)] bg-card-border/70 sm:grid-cols-4">
            {[
              { k: "Confirma al instante", v: "Respuesta en tiempo real" },
              { k: "Datos protegidos", v: "Información segura" },
              { k: "Cero filas", v: "100% en línea" },
              { k: "Historial médico", v: "Citas disponibles" },
            ].map((item) => (
              <div key={item.k} className="flex flex-col items-center justify-center gap-0.5 bg-card/80 px-4 py-3 text-center">
                <dt className="order-2 text-xs text-fg-muted text-center">{item.v}</dt>
                <dd className="order-1 text-sm font-semibold text-fg text-center">{item.k}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Decorative subtle gradient shapes */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" aria-hidden="true" />
      </section>

      {/* ¿Cómo funciona? */}
      <section id="como-funciona-section" aria-labelledby="como-funciona" className="w-full mx-auto">
        <h2 id="como-funciona" className="text-2xl sm:text-3xl font-bold text-fg -mt-6 sm:-mt-10 mb-16 sm:mb-20 text-center">
          ¿Cómo funciona el agendamiento?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 pt-2">
          <StepCard
            step="1"
            title="Elige tu médico"
            description="Revisa los médicos disponibles y elige quién atenderá tu consulta médica general."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            }
          />
          <StepCard
            step="2"
            title="Selecciona fecha y hora"
            description="Elige el día y la hora que mejor se adapte a tus tiempos entre las franjas horarias libres."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            }
          />
          <StepCard
            step="3"
            title="Confirma tu cita"
            description="Recibe confirmación instantánea. Podrás consultar o cancelar tu hora en cualquier instante."
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Datos del CESFAM */}
      <section id="datos-cesfam-section" aria-labelledby="datos-cesfam" className="w-full mx-auto glass-card rounded-[var(--radius-2xl)] p-6 sm:p-8 lg:p-10 shadow-sm">
        <h2 id="datos-cesfam" className="text-2xl font-bold text-fg mb-12 sm:mb-14 text-center">
          Información del Centro de Salud Familiar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 text-sm pt-2">
          <div className="flex flex-col gap-4">
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>}
              label="Dirección"
              value={CLINIC_INFO.address}
            />
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>}
              label="Teléfono"
              value={CLINIC_INFO.phone}
            />
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>}
              label="Email"
              value={<a href={`mailto:${CLINIC_INFO.email}`} className="text-primary hover:underline">{CLINIC_INFO.email}</a>}
            />
          </div>
          <div className="flex flex-col gap-4">
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
              label="Horario de atención"
              value={CLINIC_INFO.schedule}
            />
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>}
              label="Población"
              value="+25.000 personas en la comuna"
            />
            <InfoRow
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>}
              label="Convenio"
              value="Servicio de Salud Metropolitano Norte"
            />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section id="cta-section" aria-labelledby="cta-final" className="w-full mx-auto text-center">
        <div className="glass-card rounded-[var(--radius-2xl)] px-6 py-12 sm:py-14 shadow-sm flex flex-col items-center text-center">
          <h2 id="cta-final" className="text-2xl sm:text-3xl font-bold text-fg text-center">
            Tu próxima hora médica a un clic
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-fg-secondary text-center">
            Revisa la disponibilidad de médicos, elige el horario que te acomode y confirma al instante.
          </p>
          <Link
            href="/agendar"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-primary-hover hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all min-h-[48px]"
          >
            Agendar mi hora
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StepCard({ step, title, description, icon }: { step: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <article className="glass-card rounded-[var(--radius-xl)] p-6 relative overflow-hidden group shadow-sm">
      <span className="absolute right-4 top-3 text-5xl font-bold text-card-border/60 select-none" aria-hidden="true">{step}</span>
      <div className="flex items-start gap-4 relative">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary-soft text-primary transition-transform duration-[var(--duration-normal)] group-hover:scale-110" aria-hidden="true">
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
        <div className="text-fg-secondary">{value}</div>
      </div>
    </div>
  );
}
