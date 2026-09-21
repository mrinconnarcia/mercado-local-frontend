"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/lib/auth-context";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner, SelectField, TextField } from "@/src/components/ui/field";
import type { UserRole } from "@/src/types";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!PASSWORD_RULES.test(password)) {
      setError(
        "La contraseña debe tener al menos 8 caracteres, con mayúscula, minúscula y número.",
      );
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name,
        email,
        password,
        ...(role !== "customer" && { role }),
      });
      router.push(user.role === "business_owner" ? "/negocio/dashboard" : "/");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo completar el registro.",
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
              Crear cuenta
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Sumate y empezá en minutos
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <ErrorBanner message={error} />}

            <TextField
              id="name"
              label="Nombre"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              id="email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <TextField
                id="password"
                label="Contraseña"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-neutral-500">
                Mínimo 8 caracteres, con al menos una mayúscula, una minúscula y
                un número.
              </p>
            </div>
            <SelectField
              id="role"
              label="Quiero..."
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="customer">Comprar en negocios locales</option>
              <option value="business_owner">Vender con mi negocio</option>
            </SelectField>

            <Button type="submit" loading={loading} className="mt-2 w-full">
              Crear cuenta
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-700 hover:underline"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
