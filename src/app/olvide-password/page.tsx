"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner, TextField } from "@/src/components/ui/field";
import { AuthShell } from "@/src/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      // Siempre mostramos éxito, exista o no el email (así lo diseñamos en el backend):
      // evita que alguien use este formulario para adivinar qué emails están registrados.
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Ocurrió un error. Probá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      heading="Recuperemos tu acceso"
      subheading="Te mandamos un enlace seguro para que vuelvas a entrar a tu cuenta en un par de minutos."
      formTitle="Recuperar contraseña"
      formSubtitle="Ingresá el email con el que te registraste."
      footer={
        <p className="text-center text-sm text-neutral-600">
          <Link href="/login" className="text-emerald-700 hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="flex flex-col items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 7 9 6 9-6" />
              <rect x="3" y="5" width="18" height="14" rx="2" />
            </svg>
          </span>
          <p className="text-sm leading-relaxed text-neutral-700">
            Si ese email está registrado, vas a recibir instrucciones para
            restablecer tu contraseña. Revisá tu bandeja de entrada y la carpeta
            de spam.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {error && <ErrorBanner message={error} />}
          <TextField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" loading={loading} className="w-full">
            Enviar enlace
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
