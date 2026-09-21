"use client";

import { useEffect, useState } from "react";
import { businessPanelApi } from "@/src/lib/endpoints";
import { useBusinessPanel } from "@/src/lib/business-context";
import { ErrorBanner } from "@/src/components/ui/field";
import { ApiError } from "@/src/lib/api";
import type { DashboardSummary } from "@/src/types";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { business, loading: businessLoading } = useBusinessPanel();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!business) return;
    businessPanelApi
      .dashboard(business.id)
      .then(setSummary)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudo cargar el dashboard.",
        ),
      );
  }, [business]);

  if (businessLoading || !summary)
    return <p className="text-neutral-500">Cargando...</p>;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">
        {summary.business.name}
      </h1>
      <span
        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
          summary.business.status === "approved"
            ? "bg-emerald-100 text-emerald-700"
            : summary.business.status === "pending"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
        }`}
      >
        {summary.business.status === "approved"
          ? "Aprobado"
          : summary.business.status === "pending"
            ? "Pendiente de aprobación"
            : "Suspendido"}
      </span>

      <h2 className="mt-6 text-sm font-semibold uppercase text-neutral-500">
        Pedidos
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Pendientes" value={summary.orders.pending} />
        <StatCard label="Aceptados" value={summary.orders.accepted} />
        <StatCard label="Preparando" value={summary.orders.preparing} />
        <StatCard label="Listos" value={summary.orders.ready} />
        <StatCard label="Entregados" value={summary.orders.delivered} />
        <StatCard label="Cancelados" value={summary.orders.cancelled} />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase text-neutral-500">
        Productos
      </h2>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <StatCard label="Total" value={summary.products.total} />
        <StatCard label="Disponibles" value={summary.products.available} />
        <StatCard label="Sin stock" value={summary.products.out_of_stock} />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase text-neutral-500">
        Ventas
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <StatCard
          label="Ingresos totales"
          value={`$${summary.sales.total_revenue.toFixed(2)}`}
        />
        <StatCard
          label="Pedidos entregados"
          value={summary.sales.orders_delivered}
        />
      </div>
    </div>
  );
}
