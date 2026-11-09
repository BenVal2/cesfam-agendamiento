"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Field from "@/components/Field";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateField(field: "email" | "password", value: string) {
    let message = "";
    if (field === "email") {
      if (!value.trim()) message = "Ingresa tu email.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) message = "Ingresa un email válido.";
    }
    if (field === "password" && !value) message = "Ingresa tu contraseña.";

    setFieldErrors((prev) => ({ ...prev, [field]: message }));
    return message;
  }

  function validateAll() {
    const errors: Record<string, string> = {};
    errors.email = validateField("email", email);
    errors.password = validateField("password", password);
    setTouched({ email: true, password: true });
    const missing = Object.entries(errors)
      .filter(([, message]) => message)
      .map(([field]) => (field === "email" ? "email" : "contraseña"));
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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push("/agendar");
      router.refresh();
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

      <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col glass-card rounded-[var(--radius-2xl)] p-6 sm:p-8 gap-5">
        <Field
          id="email"
          label="Email"
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
          id="password"
          label="Contraseña"
          type="password"
          required
          autoComplete="current-password"
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
          placeholder="••••••"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-on-primary hover:bg-primary-hover disabled:opacity-50 transition-colors min-h-[48px]"
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
