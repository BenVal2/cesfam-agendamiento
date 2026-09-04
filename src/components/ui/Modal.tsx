"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm?: () => void;
  loading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel = "Confirmar",
  confirmVariant = "primary",
  onConfirm,
  loading = false,
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-md rounded-[var(--radius-2xl)] bg-card border border-card-border p-6 shadow-xl flex flex-col gap-4 text-fg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="modal-title" className="text-lg font-bold text-fg">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-fg-secondary mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-fg-muted hover:text-fg hover:bg-card-hover rounded-[var(--radius-md)] transition-colors"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {children && <div className="py-2">{children}</div>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-[var(--radius-md)] border border-card-border bg-card px-4 py-2.5 text-sm font-medium text-fg hover:bg-card-hover disabled:opacity-50 transition-colors min-h-[44px]"
          >
            Cancelar
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors min-h-[44px] ${
                confirmVariant === "danger"
                  ? "bg-danger hover:bg-danger-hover"
                  : "bg-primary hover:bg-primary-hover"
              }`}
            >
              {loading ? "Procesando..." : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
