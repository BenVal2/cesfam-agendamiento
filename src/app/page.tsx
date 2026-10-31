import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero + comprobante */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Atención primaria · Recoleta
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-fg">
            Tu hora médica,<br />
            <span className="text-primary">sin filas.</span>
          </h1>
          <p className="text-lg text-fg-secondary max-w-md leading-relaxed">
            Agenda tu consulta con los médicos generales del CESFAM Cristo Vive
            en línea. Eliges médico, fecha y hora, y recibes un comprobante al
            instante.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
            <Link
              href="/agendar"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-7 py-3.5 text-base font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[48px]"
            >
              Agendar ahora
            </Link>
            <Link
              href="/mis-citas"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-card-border px-7 py-3.5 text-base font-semibold text-fg hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[48px]"
            >
              Ver mis citas
            </Link>
          </div>
        </div>

        {/* Comprobante de hora — único elemento elevado */}
        <div className="ticket rounded-[var(--radius-lg)] p-6 sm:p-8 max-w-md mx-auto lg:mx-0 lg:ml-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fg-muted">
              Comprobante de atención
            </p>
            <span className="stamp">Confirmada</span>
          </div>

          <div className="space-y-4 border-t border-b border-card-border py-5">
            <ReceiptRow label="Paciente" value="Ana Valenzuela" />
            <ReceiptRow label="Médico" value="Dr. Carlos López" />
            <ReceiptRow label="Especialidad" value="Medicina General" />
            <ReceiptRow label="Fecha" value="Lunes 2 de noviembre" />
            <ReceiptRow label="Hora" value="09:30 hrs" />
          </div>

          <div className="mt-5 flex items-center justify-between text-xs text-fg-muted">
            <span>CESFAM Cristo Vive</span>
            <span className="attention-number">Nº 0042</span>
          </div>
        </div>
      </section>

      {/* ¿Cómo funciona? */}
      <section aria-labelledby="como-funciona" className="ficha pt-8">
        <h2 id="como-funciona" className="text-2xl sm:text-3xl font-bold text-fg mb-8">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StepCard step="1" title="Elige tu médico" description="Revisa los médicos disponibles y elige quién atenderá tu consulta." />
          <StepCard step="2" title="Selecciona fecha y hora" description="Elige el día y la hora que mejor se adapte a tu horario. Solo mostramos las horas disponibles." />
          <StepCard step="3" title="Confirma tu cita" description="Recibe confirmación instantánea. Puedes ver o cancelar tus citas en cualquier momento." />
        </div>
      </section>

      {/* Datos del CESFAM */}
      <section aria-labelledby="datos-cesfam" className="ficha pt-8">
        <h2 id="datos-cesfam" className="text-2xl font-bold text-fg mb-6">
          CESFAM Cristo Vive
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 text-sm">
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
        </div>
      </section>

      {/* CTA final */}
      <section className="text-center py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-fg mb-3">
          ¿Listo para agendar?
        </h2>
        <p className="text-fg-secondary mb-6">Crea tu cuenta y reserva tu hora en menos de un minuto.</p>
        <Link
          href="/agendar"
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-7 py-3.5 text-base font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[48px]"
        >
          Agendar ahora
        </Link>
      </section>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <article className="border-t-2 border-primary pt-4">
      <span className="text-xs font-bold uppercase tracking-widest text-primary">Paso {step}</span>
      <h3 className="font-semibold text-fg text-lg leading-snug mt-1">{title}</h3>
      <p className="text-sm text-fg-secondary mt-1.5 leading-relaxed">{description}</p>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">{label}</p>
        <p className="text-fg mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="font-semibold text-fg text-right">{value}</span>
    </div>
  );
}
