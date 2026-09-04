"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Field from "@/components/Field";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      window.location.href = "/agendar";
    }
  }

  return (
    <div className="w-full flex justify-center py-8 sm:py-12">
      <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] bg-primary-soft text-primary mb-4" aria-hidden="true">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-fg mb-2">
          Iniciar sesión
        </h1>
        <p className="text-fg-secondary">
          Ingresa a tu cuenta para agendar y ver tus citas.
        </p>
        <p className="text-xs text-fg-muted">
          Tus datos están protegidos y solo los usa tu centro de salud.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-danger/30 p-4 text-sm font-medium text-danger bg-danger-soft" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex w-full flex-col glass-card rounded-[var(--radius-2xl)] p-6 sm:p-8 gap-5">
        <Field id="email" label="Email" type="email" required value={email} onChange={setEmail} placeholder="tu@email.com" />
        <Field id="password" label="Contraseña" type="password" required value={password} onChange={setPassword} placeholder="••••••" />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors min-h-[48px]"
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-secondary">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-primary hover:underline">
          Regístrate aquí
        </Link>
      </p>
      </div>
    </div>
  );
}
