"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner } from "@/src/components/ui/field";
import type { AdminUserDetail } from "@/src/types";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .getUser(id)
      .then(setUser)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudo cargar el usuario.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await adminApi.toggleUserActive(id);
      load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo cambiar el estado.",
      );
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <p className="text-neutral-500">Cargando...</p>;
  if (error && !user) return <ErrorBanner message={error} />;
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">{user.name}</h1>
      <p className="text-sm text-neutral-500">
        {user.email} · {user.role}
      </p>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mt-4">
        <Button
          variant={user.active ? "danger" : "secondary"}
          loading={toggling}
          onClick={handleToggle}
        >
          {user.active ? "Desactivar cuenta" : "Activar cuenta"}
        </Button>
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase text-neutral-500">
        Pedidos realizados
      </h2>
      <p className="mt-1 text-neutral-700">{user.orders_count}</p>

      {user.businesses.length > 0 && (
        <>
          <h2 className="mt-6 text-sm font-semibold uppercase text-neutral-500">
            Negocios
          </h2>
          <ul className="mt-2 flex flex-col gap-1">
            {user.businesses.map((b) => (
              <li key={b.id} className="text-sm text-neutral-700">
                {b.name} — {b.status}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
