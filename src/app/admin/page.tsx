"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/src/lib/endpoints";
import type { AdminStats } from "@/src/types";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    adminApi.stats().then(setStats);
  }, []);

  if (!stats) return <p className="text-neutral-500">Cargando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">
        Estadísticas globales
      </h1>

      <h2 className="mt-6 text-sm font-semibold uppercase text-neutral-500">
        Usuarios
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total" value={stats.users.total} />
        <StatCard label="Clientes" value={stats.users.customers} />
        <StatCard label="Dueños" value={stats.users.business_owners} />
        <StatCard label="Admins" value={stats.users.admins} />
        <StatCard label="Inactivos" value={stats.users.inactive} />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase text-neutral-500">
        Negocios
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.businesses.total} />
        <StatCard label="Pendientes" value={stats.businesses.pending} />
        <StatCard label="Aprobados" value={stats.businesses.approved} />
        <StatCard label="Suspendidos" value={stats.businesses.suspended} />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase text-neutral-500">
        Productos
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:w-64">
        <StatCard label="Total" value={stats.products.total} />
        <StatCard label="Sin stock" value={stats.products.out_of_stock} />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase text-neutral-500">
        Pedidos
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.orders.total} />
        <StatCard label="Pendientes" value={stats.orders.pending} />
        <StatCard label="En curso" value={stats.orders.in_progress} />
        <StatCard label="Entregados" value={stats.orders.delivered} />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase text-neutral-500">
        Ingresos
      </h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:w-96">
        <StatCard label="Total" value={`$${stats.revenue.total.toFixed(2)}`} />
        <StatCard
          label="Últimos 30 días"
          value={`$${stats.revenue.last_30_days.toFixed(2)}`}
        />
      </div>
    </div>
  );
}
