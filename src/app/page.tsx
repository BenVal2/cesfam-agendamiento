import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-14 sm:space-y-20 lg:space-y-24">
      {/* Hero + comprobante */}
      <section className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div className="hero-enter space-y-7">
          <p className="flex items-center gap-3 text-sm font-bold text-primary">
            <span className="h-px w-14 bg-primary" aria-hidden="true" />
            Atención primaria · Recoleta
          </p>
          <h1 className="max-w-3xl font-display text-6xl font-bold leading-[0.92] tracking-tight text-balance text-fg sm:text-7xl lg:text-8xl">
            Tu hora médica,<br />
            <span className="text-primary">sin filas.</span>
          </h1>
          <p className="max-w-xl text-xl leading-relaxed text-fg-secondary">
            Agenda tu consulta con los médicos generales del CESFAM Cristo Vive
            en línea. Eliges médico, fecha y hora, y recibes un comprobante al
            instante.
          </p>
          <div className="grid max-w-xl grid-cols-2 overflow-hidden rounded-[var(--radius-lg)] border border-card-border bg-card text-sm sm:grid-cols-3" aria-label="Horario de atención">
            <div className="border-r border-card-border px-4 py-3">
              <p className="font-bold text-fg">Lun a Vie</p>
              <p className="text-fg-muted">09:00–12:00</p>
            </div>
            <div className="px-4 py-3 sm:border-r sm:border-card-border">
              <p className="font-bold text-fg">Tarde</p>
              <p className="text-fg-muted">14:00–17:00</p>
            </div>
            <div className="col-span-2 border-t border-card-border px-4 py-3 sm:col-span-1 sm:border-t-0">
              <p className="font-bold text-fg">Ventana</p>
              <p className="text-fg-muted">Hasta 30 días</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <Link
              href="/agendar"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-7 py-3.5 text-base font-semibold text-on-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[48px] sm:w-auto"
            >
              Agendar ahora
            </Link>
            <Link
              href="/mis-citas"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-card-border px-7 py-3.5 text-base font-semibold text-fg hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[48px] sm:w-auto"
            >
              Ver mis citas
            </Link>
          </div>
        </div>

        {/* Comprobante de hora — único elemento elevado */}
        <div className="ticket-enter mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
          <article
            className="ticket rounded-[var(--radius-lg)] p-6 sm:p-8"
            aria-labelledby="ticket-title"
          >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-fg-muted">Ficha de atención</p>
              <h2 id="ticket-title" className="mt-1 text-base font-bold text-fg">
                Comprobante de hora
              </h2>
            </div>
            <span className="stamp">Confirmada</span>
          </div>

          <div className="border-y border-dashed border-card-border py-5">
            <p className="text-xs font-semibold text-fg-muted">Fecha y hora</p>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
              <p className="attention-number text-3xl leading-none text-fg">Lun 02 nov</p>
              <p className="attention-number text-3xl leading-none text-primary">09:30</p>
            </div>
          </div>

          <dl className="space-y-4 pt-5">
            <ReceiptRow label="Paciente" value="Ana Valenzuela" />
            <ReceiptRow label="Médico" value="Dr. Carlos López" />
            <ReceiptRow label="Especialidad" value="Medicina General" />
          </dl>

          <div className="mt-6 flex items-center justify-between border-t border-card-border pt-4 text-xs text-fg-muted">
            <span>CESFAM Cristo Vive</span>
            <span className="attention-number">Nº 0042</span>
          </div>
          </article>
        </div>
      </section>

      {/* ¿Cómo funciona? */}
      <section aria-labelledby="como-funciona" className="ficha pt-8">
        <h2 id="como-funciona" className="font-display text-2xl sm:text-3xl font-bold text-fg mb-8">
          ¿Cómo funciona?
        </h2>
        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StepCard step="1" title="Elige tu médico" description="Revisa los médicos disponibles y elige quién atenderá tu consulta." />
          <StepCard step="2" title="Selecciona fecha y hora" description="Elige el día y la hora que mejor se adapte a tu horario. Solo mostramos las horas disponibles." />
          <StepCard step="3" title="Confirma tu cita" description="Recibe confirmación instantánea. Puedes ver o cancelar tus citas en cualquier momento." />
        </ol>
      </section>

      {/* Datos del CESFAM */}
      <section aria-labelledby="datos-cesfam" className="ficha pt-8">
        <h2 id="datos-cesfam" className="font-display text-2xl font-bold text-fg mb-6">
          CESFAM Cristo Vive
        </h2>
        <dl className="grid grid-cols-1 gap-8 text-sm sm:grid-cols-2 sm:gap-10">
          <div className="space-y-4">
            <InfoRow label="Dirección" value="Av. Recoleta 4125, Recoleta, Región Metropolitana" />
            <InfoRow label="Teléfono" value="+56 2 622 6380" />
            <InfoRow label="Email" value={<a href="mailto:cesfam@fundacioncristovive.cl" className="text-primary hover:underline">cesfam@fundacioncristovive.cl</a>} />
          </div>
          <div className="space-y-4">
            <InfoRow label="Horario de atención" value="Lunes a viernes, 9:00 - 12:00 / 14:00 - 17:00" />
            <InfoRow label="Población" value="+25.000 personas en Recoleta" />
            <InfoRow label="Convenio" value="Servicio de Salud Metropolitano Norte (desde 1993)" />
          </div>
        </dl>
      </section>

      {/* CTA final */}
      <section className="rounded-[var(--radius-2xl)] bg-primary px-6 py-10 text-center text-on-primary sm:px-10 sm:py-12">
        <h2 className="mb-3 font-display text-2xl font-bold sm:text-3xl">
          ¿Listo para agendar?
        </h2>
        <p className="mx-auto mb-6 max-w-md opacity-80">Crea tu cuenta y reserva tu hora en menos de un minuto.</p>
        <Link
          href="/agendar"
          className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-on-primary px-7 py-3.5 text-base font-semibold text-primary transition-colors min-h-[48px] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-on-primary focus:ring-offset-2 sm:w-auto"
        >
          Agendar ahora
        </Link>
      </section>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <li className="border-t-2 border-primary pt-4">
      <span className="text-sm font-bold text-primary">Paso {step}</span>
      <h3 className="font-semibold text-fg text-lg leading-snug mt-1">{title}</h3>
      <p className="text-sm text-fg-secondary mt-1.5 leading-relaxed">{description}</p>
    </li>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0">
        <dt className="text-sm font-bold text-fg-muted">{label}</dt>
        <dd className="text-fg mt-0.5">{value}</dd>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="font-semibold text-fg text-right">{value}</dd>
    </div>
  );
}
