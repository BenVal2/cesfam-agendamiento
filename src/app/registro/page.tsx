"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Field from "@/components/Field";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateField(field: "name" | "email" | "phone" | "password", value: string) {
    let message = "";
    if (field === "name" && !value.trim()) message = "Ingresa tu nombre completo.";
    if (field === "email") {
      if (!value.trim()) message = "Ingresa tu email.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) message = "Ingresa un email válido.";
    }
    if (field === "phone" && value.trim() && !/^\+?[\d\s-]{7,}$/.test(value.trim())) {
      message = "Ingresa un teléfono válido o déjalo vacío.";
    }
    if (field === "password") {
      if (!value) message = "Crea una contraseña.";
      else if (value.length < 6) message = "La contraseña debe tener al menos 6 caracteres.";
    }

    setFieldErrors((prev) => ({ ...prev, [field]: message }));
    return message;
  }

  function validateAll() {
    const errors: Record<string, string> = {};
    errors.name = validateField("name", name);
    errors.email = validateField("email", email);
    errors.phone = validateField("phone", phone);
    errors.password = validateField("password", password);
    setTouched({ name: true, email: true, phone: true, password: true });
    const labels: Record<string, string> = {
      name: "nombre completo",
      email: "email",
      phone: "teléfono",
      password: "contraseña",
    };
    const missing = Object.entries(errors)
      .filter(([, message]) => message)
      .map(([field]) => labels[field]);
    if (missing.length > 0) {
      setError(`Completa estos campos: ${missing.join(", ")}.`);
      return false;
    }
    setError(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll()) return;
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
        router.push("/login");
      } else {
        router.push("/agendar");
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <div className="auth-scene relative isolate flex w-full justify-center overflow-hidden rounded-[var(--radius-2xl)] border border-card-border px-4 py-10 sm:px-8 sm:py-16">
      <div aria-hidden="true" className="auth-orb pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/35 blur-3xl" />
      <div aria-hidden="true" className="auth-orb pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-secondary/30 blur-3xl [animation-delay:-4s]" />
      <div aria-hidden="true" className="auth-orb pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl [animation-delay:-7s]" />
      <div className="relative w-full max-w-md">
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

      <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col auth-glass rounded-[var(--radius-2xl)] p-6 sm:p-8 gap-5">
        <Field
          id="name"
          label="Nombre completo *"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(v) => {
            setName(v);
            if (touched.name) validateField("name", v);
          }}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, name: true }));
            validateField("name", name);
          }}
          invalid={Boolean(touched.name && fieldErrors.name)}
          placeholder="Tu nombre"
        />
        <Field
          id="email"
          label="Email *"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            if (touched.email) validateField("email", v);
          }}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, email: true }));
            validateField("email", email);
          }}
          invalid={Boolean(touched.email && fieldErrors.email)}
          placeholder="tu@email.com"
        />
        <Field
          id="phone"
          label="Teléfono (opcional)"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(v) => {
            setPhone(v);
            if (touched.phone) validateField("phone", v);
          }}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, phone: true }));
            validateField("phone", phone);
          }}
          invalid={Boolean(touched.phone && fieldErrors.phone)}
          placeholder="+56 9 1234 5678"
        />
        <Field
          id="password"
          label="Contraseña *"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (touched.password) validateField("password", v);
          }}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, password: true }));
            validateField("password", password);
          }}
          invalid={Boolean(touched.password && fieldErrors.password)}
          placeholder="Mínimo 6 caracteres"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-50 transition-colors min-h-[48px]"
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
