"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Field from "@/components/Field";

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al registrar");
      }

      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        window.location.href = "/login";
      } else {
        window.location.href = "/agendar";
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex justify-center py-8 sm:py-12">
      <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary mb-4" aria-hidden="true">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
          </svg>
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-fg mb-2">
          Crear cuenta
        </h1>
        <p className="text-fg-secondary">
          Regístrate para agendar tus citas médicas.
        </p>
        <p className="text-xs text-fg-muted">
          Solo necesitamos tus datos básicos. Nada más.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-danger/30 p-4 text-sm font-medium text-danger bg-danger-soft" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full glass-card rounded-[var(--radius-2xl)] p-6 sm:p-8 space-y-5">
        <Field id="name" label="Nombre completo *" type="text" required value={name} onChange={setName} placeholder="Tu nombre" />
        <Field id="email" label="Email *" type="email" required value={email} onChange={setEmail} placeholder="tu@email.com" />
        <Field id="phone" label="Teléfono (opcional)" type="tel" value={phone} onChange={setPhone} placeholder="+56 9 1234 5678" />
        <Field id="password" label="Contraseña *" type="password" required minLength={6} value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors min-h-[48px]"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-secondary">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
      </div>
    </div>
  );
}
