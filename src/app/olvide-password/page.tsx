"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner, TextField } from "@/src/components/ui/field";

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
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold text-neutral-900">
        Recuperar contraseña
      </h1>

      {sent ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Si ese email está registrado, te enviamos instrucciones para
          restablecer tu contraseña. Revisá tu bandeja de entrada.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}
          <p className="text-sm text-neutral-600">
            Ingresá el email con el que te registraste y te mandamos un enlace
            para restablecer tu contraseña.
          </p>
          <TextField
            id="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" loading={loading} className="w-full">
            Enviar enlace
          </Button>
        </form>
      )}

      <p className="text-sm text-neutral-600">
        <Link href="/login" className="text-emerald-700 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
