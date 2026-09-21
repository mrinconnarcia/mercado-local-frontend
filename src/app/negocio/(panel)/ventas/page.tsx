"use client";

import { useEffect, useState, type FormEvent } from "react";
import { businessPanelApi } from "@/src/lib/endpoints";
import { useBusinessPanel } from "@/src/lib/business-context";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner, TextField } from "@/src/components/ui/field";
import type { SalesReport } from "@/src/types";

export default function SalesPage() {
  const { business } = useBusinessPanel();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!business) return;
    setLoading(true);
    businessPanelApi
      .sales(business.id, { from: from || undefined, to: to || undefined })
      .then(setReport)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar las ventas.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [business]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Ventas</h1>

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          load();
        }}
        className="mt-4 flex items-end gap-3"
      >
        <TextField
          id="from"
          label="Desde"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <TextField
          id="to"
          label="Hasta"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <Button type="submit">Filtrar</Button>
      </form>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <p className="mt-4 text-neutral-500">Cargando...</p>
      ) : report ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:w-96">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-xs text-neutral-500">Ingresos</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                ${report.total_revenue.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-xs text-neutral-500">Pedidos</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                {report.count}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {report.sales.map((sale) => (
              <div
                key={sale.id}
                className="rounded-lg border border-neutral-200 bg-white p-3 text-sm"
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    Pedido #{sale.id} — {sale.customer}
                  </span>
                  <span className="font-semibold">
                    ${sale.total.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {new Date(sale.delivered_at).toLocaleString()}
                </p>
                <ul className="mt-1 text-xs text-neutral-600">
                  {sale.items.map((item, i) => (
                    <li key={i}>
                      {item.quantity}× {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
