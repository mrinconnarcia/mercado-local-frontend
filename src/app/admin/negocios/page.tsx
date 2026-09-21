"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner } from "@/src/components/ui/field";
import type { AdminBusiness, BusinessStatus } from "@/src/types";

const FILTERS: Array<{ label: string; value: BusinessStatus | "" }> = [
  { label: "Todos", value: "" },
  { label: "Pendientes", value: "pending" },
  { label: "Aprobados", value: "approved" },
  { label: "Suspendidos", value: "suspended" },
];

const STATUS_LABEL: Record<BusinessStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  suspended: "Suspendido",
};
const STATUS_COLOR: Record<BusinessStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-700",
};

export default function AdminBusinessesPage() {
  const [filter, setFilter] = useState<BusinessStatus | "">("pending");
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listBusinesses(filter ? { status: filter } : undefined)
      .then((res) => setBusinesses(res.data))
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los negocios.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const act = async (
    business: AdminBusiness,
    action: "approveBusiness" | "suspendBusiness" | "reactivateBusiness",
  ) => {
    setActingId(business.id);
    try {
      const updated = await adminApi[action](business.id);
      setBusinesses((prev) =>
        prev.map((b) => (b.id === business.id ? updated : b)),
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar el negocio.",
      );
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Negocios</h1>

      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${filter === f.value ? "bg-emerald-600 text-white" : "bg-neutral-100 text-neutral-600"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <p className="mt-4 text-neutral-500">Cargando...</p>
      ) : businesses.length === 0 ? (
        <p className="mt-4 text-neutral-500">No hay negocios con ese filtro.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {businesses.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-neutral-900">{b.name}</p>
                <p className="text-xs text-neutral-500">
                  {b.category} · {b.address ?? "sin dirección"}
                </p>
                <p className="text-xs text-neutral-400">
                  Dueño: {b.owner.name} ({b.owner.email})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[b.status]}`}
                >
                  {STATUS_LABEL[b.status]}
                </span>
                {b.status === "pending" && (
                  <Button
                    loading={actingId === b.id}
                    onClick={() => act(b, "approveBusiness")}
                  >
                    Aprobar
                  </Button>
                )}
                {b.status === "approved" && (
                  <Button
                    variant="danger"
                    loading={actingId === b.id}
                    onClick={() => act(b, "suspendBusiness")}
                  >
                    Suspender
                  </Button>
                )}
                {b.status === "suspended" && (
                  <Button
                    variant="secondary"
                    loading={actingId === b.id}
                    onClick={() => act(b, "reactivateBusiness")}
                  >
                    Reactivar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
