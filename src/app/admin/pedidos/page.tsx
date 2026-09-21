"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { OrderStatusBadge } from "@/src/components/order-status-badge";
import { ErrorBanner } from "@/src/components/ui/field";
import type {
  AdminOrderDetail,
  AdminOrderListItem,
  OrderStatus,
} from "@/src/types";

const FILTERS: Array<{ label: string; value: OrderStatus | "" }> = [
  { label: "Todos", value: "" },
  { label: "Pendientes", value: "pending" },
  { label: "Aceptados", value: "accepted" },
  { label: "Preparando", value: "preparing" },
  { label: "Listos", value: "ready" },
  { label: "Entregados", value: "delivered" },
  { label: "Cancelados", value: "cancelled" },
];

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, AdminOrderDetail>>(
    {},
  );

  const load = () => {
    setLoading(true);
    adminApi
      .listOrders(filter ? { status: filter } : undefined)
      .then((res) => setOrders(res.data))
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los pedidos.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const toggleExpand = async (id: number) => {
    if (expanded[id]) {
      setExpanded((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    const detail = await adminApi.getOrder(id);
    setExpanded((prev) => ({ ...prev, [id]: detail }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Todos los pedidos</h1>

      <div className="mt-4 flex flex-wrap gap-2">
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
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {orders.map((order) => {
            const detail = expanded[order.id];
            return (
              <div
                key={order.id}
                className="rounded-lg border border-neutral-200 bg-white p-4"
              >
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div>
                    <p className="font-medium text-neutral-900">
                      Pedido #{order.id} — {order.customer.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {order.business.name} ·{" "}
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-neutral-800">
                      ${order.total.toFixed(2)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </button>
                {detail && (
                  <ul className="mt-3 border-t border-neutral-100 pt-3 text-sm text-neutral-600">
                    {detail.items.map((item, i) => (
                      <li key={i}>
                        {item.quantity}× {item.name} — $
                        {item.unit_price.toFixed(2)} c/u
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
