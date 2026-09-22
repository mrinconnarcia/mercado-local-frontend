"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/lib/auth-context";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import {
  ErrorBanner,
  SelectField,
  TextField,
} from "@/src/components/ui/field";
import { AuthShell } from "@/src/components/auth/auth-shell";
import type { UserRole } from "@/src/types";

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

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
    <AuthShell
      heading="Sumate a tu mercado local"
      subheading="Creá tu cuenta y empezá a comprar o vender con los negocios de tu barrio en minutos."
      formTitle="Crear cuenta"
      formSubtitle="Completá tus datos para empezar."
      footer={
        <p className="text-center text-sm text-neutral-600">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-700 hover:underline"
          >
            Iniciá sesión
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && <ErrorBanner message={error} />}

        <TextField
          id="name"
          label="Nombre"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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

        <p className="text-center text-xs text-neutral-400">
          Al crear tu cuenta aceptás nuestros{" "}
          <Link href="/terminos" className="underline hover:text-neutral-600">
            Términos
          </Link>{" "}
          y{" "}
          <Link
            href="/privacidad"
            className="underline hover:text-neutral-600"
          >
            Política de privacidad
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}