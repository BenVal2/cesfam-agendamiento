import React from "react";

interface StepIndicatorProps {
  current: number;
  total: number;
}

const STEP_LABELS = ["Médico", "Fecha", "Hora"];

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <nav aria-label="Progreso del agendamiento" className="mb-8">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {Array.from({ length: total }, (_, i) => i + 1).map((step) => {
          const isCurrent = step === current;
          const isCompleted = step < current;

          return (
            <li key={step} className="flex items-center gap-2 sm:gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  isCurrent
                    ? "bg-primary text-white shadow-md ring-4 ring-primary/20"
                    : isCompleted
                      ? "bg-secondary text-white"
                      : "bg-card-border text-fg-muted"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  step
                )}
              </span>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  isCurrent ? "text-primary font-bold" : isCompleted ? "text-secondary" : "text-fg-muted"
                }`}
              >
                {STEP_LABELS[step - 1]}
              </span>
              {step < total && (
                <div
                  className={`h-0.5 w-6 sm:w-12 transition-colors ${
                    isCompleted ? "bg-secondary" : "bg-card-border"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="text-center text-xs text-fg-muted mt-3 font-medium">
        Paso {current} de {total}
      </p>
    </nav>
  );
}
