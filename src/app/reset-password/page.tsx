"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner, TextField } from "@/src/components/ui/field";
import { AuthShell } from "@/src/components/auth/auth-shell";

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!PASSWORD_RULES.test(password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, con mayúscula, minúscula y número.",
      );
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo restablecer la contraseña.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        heading="Recuperemos tu acceso"
        subheading="Pedí un nuevo enlace de recuperación para volver a entrar a tu cuenta."
        formTitle="Enlace no válido"
        formSubtitle="Este enlace venció o ya fue utilizado."
      >
        <div className="flex flex-col gap-4">
          <ErrorBanner message="Pedí un enlace nuevo desde 'Olvidé mi contraseña'." />
          <Link
            href="/olvide-password"
            className="text-center text-sm font-medium text-emerald-700 hover:underline"
          >
            Ir a recuperar contraseña
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      heading="Ya casi terminás"
      subheading="Elegí una contraseña nueva y segura para volver a entrar a tu cuenta."
      formTitle="Nueva contraseña"
      formSubtitle="Elegí una contraseña nueva para tu cuenta."
    >
      {success ? (
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
              <path d="m5 13 4 4L19 7" />
            </svg>
          </span>
          <p className="text-sm leading-relaxed text-neutral-700">
            Tu contraseña se actualizó correctamente. Te llevamos a iniciar
            sesión...
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {error && <ErrorBanner message={error} />}
          <div className="flex flex-col gap-1.5">
            <TextField
              id="password"
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-neutral-500">
              Mínimo 8 caracteres, con mayúscula, minúscula y número.
            </p>
          </div>
          <TextField
            id="confirm_password"
            label="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" loading={loading} className="w-full">
            Restablecer contraseña
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-neutral-50">
          <p className="text-neutral-500">Cargando...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
