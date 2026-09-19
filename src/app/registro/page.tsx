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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
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
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold text-neutral-900">Crear cuenta</h1>

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
        <TextField
          id="password"
          label="Contraseña"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <SelectField
          id="role"
          label="Quiero..."
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="customer">Comprar en negocios locales</option>
          <option value="business_owner">Vender con mi negocio</option>
        </SelectField>

        <Button type="submit" loading={loading} className="w-full">
          Crear cuenta
        </Button>
      </form>

      <p className="text-sm text-neutral-600">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-emerald-700 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
