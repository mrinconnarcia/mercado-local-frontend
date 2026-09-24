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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [business]);

  return (
    <div>
      <h1 className="font-serif text-2xl text-neutral-900">Ventas</h1>

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          load();
        }}
        className="mt-4 flex flex-wrap items-end gap-3"
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
        <div className="mt-4 grid grid-cols-2 gap-3 sm:w-96">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-neutral-100"
            />
          ))}
        </div>
      ) : report ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:w-96">
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="text-xs text-neutral-500">Ingresos totales</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">
                ${report.total_revenue.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <p className="text-xs text-neutral-500">Pedidos entregados</p>
              <p className="mt-1 text-2xl font-semibold text-neutral-900">
                {report.count}
              </p>
            </div>
          </div>

          {report.sales.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">
              No hay ventas en ese rango de fechas.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {report.sales.map((sale) => (
                <div
                  key={sale.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-neutral-900">
                        Pedido #{sale.id} — {sale.customer}
                      </span>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {new Date(sale.delivered_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block font-semibold text-neutral-900">
                        ${sale.total.toFixed(2)}
                      </span>
                      {/* ✅ Muestra el descuento si existió */}
                      {sale.discount && sale.discount > 0 && (
                        <span className="block text-xs text-emerald-600">
                          (Incluye -$ {sale.discount.toFixed(2)} de descuento)
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-2 text-xs text-neutral-600">
                    {sale.items.map((item, i) => (
                      <li key={i} className="flex justify-between">
                        <span>
                          {item.quantity}× {item.name}
                        </span>
                        {item.unit_price && (
                          <span className="text-neutral-500">
                            ${(item.quantity * item.unit_price).toFixed(2)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
