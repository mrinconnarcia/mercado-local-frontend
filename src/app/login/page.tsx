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
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold text-neutral-900">Iniciar sesión</h1>

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

        <Button type="submit" loading={loading} className="w-full">
          Entrar
        </Button>
      </form>

      <p className="text-sm text-neutral-600">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="text-emerald-700 hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}
