"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/lib/auth-context";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner, TextField } from "@/src/components/ui/field";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "business_owner")
        router.push("/negocio/dashboard");
      else router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo iniciar sesión.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-10 sm:py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-sm">
            L
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Iniciar sesión
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Ingresá a tu cuenta para continuar
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <ErrorBanner message={error} />}

            <TextField
              id="email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              id="password"
              label="Contraseña"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" loading={loading} className="mt-2 w-full">
              Entrar
            </Button>
          </form>
        </div>

        <p className="text-right text-sm">
          <Link
            href="/olvide-password"
            className="text-emerald-700 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        <p className="mt-6 text-center text-sm text-neutral-600">
          ¿No tenés cuenta?{" "}
          <Link
            href="/registro"
            className="font-medium text-emerald-700 hover:underline"
          >
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}
