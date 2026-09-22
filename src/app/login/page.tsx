"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/lib/auth-context";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner, TextField } from "@/src/components/ui/field";
import { AuthShell } from "@/src/components/auth/auth-shell";

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
    <AuthShell
      heading="Tu mercado local, a un clic de distancia"
      subheading="Conectá con negocios de tu zona y hacé tus compras con confianza, de principio a fin."
      formTitle="Iniciar sesión"
      formSubtitle="Ingresá tus datos para continuar."
      footer={
        <p className="text-center text-sm text-neutral-600">
          ¿No tenés cuenta?{" "}
          <Link
            href="/registro"
            className="font-medium text-emerald-700 hover:underline"
          >
            Registrate
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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

        <div className="flex flex-col gap-1.5">
          <TextField
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right">
            <Link
              href="/olvide-password"
              className="text-sm text-emerald-700 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <Button type="submit" loading={loading} className="mt-2 w-full">
          Entrar
        </Button>
      </form>
    </AuthShell>
  );
}
