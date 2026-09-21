"use client";

import { useEffect, useState } from "react";
import { businessOrdersApi } from "@/src/lib/endpoints";
import { useBusinessPanel } from "@/src/lib/business-context";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner } from "@/src/components/ui/field";
import type { BusinessOrder, OrderStatus } from "@/src/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const NEXT_STATUS: Partial<
  Record<OrderStatus, { status: OrderStatus; label: string }>
> = {
  pending: { status: "accepted", label: "Aceptar" },
  accepted: { status: "preparing", label: "Empezar a preparar" },
  preparing: { status: "ready", label: "Marcar listo" },
  ready: { status: "delivered", label: "Marcar entregado" },
};

const FILTERS: Array<{ label: string; value: OrderStatus | "" }> = [
  { label: "Todos", value: "" },
  { label: "Pendientes", value: "pending" },
  { label: "Aceptados", value: "accepted" },
  { label: "Preparando", value: "preparing" },
  { label: "Listos", value: "ready" },
  { label: "Entregados", value: "delivered" },
  { label: "Cancelados", value: "cancelled" },
];

export default function BusinessOrdersPage() {
  const { business } = useBusinessPanel();
  const [orders, setOrders] = useState<BusinessOrder[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const load = () => {
    if (!business) return;
    setLoading(true);
    businessOrdersApi
      .listForBusiness(business.id, filter ? { status: filter } : undefined)
      .then(setOrders)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los pedidos.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [business, filter]);

  const changeStatus = async (order: BusinessOrder, status: OrderStatus) => {
    if (!business) return;
    setActingId(order.id);
    setError(null);
    try {
      const updated = await businessOrdersApi.updateStatus(
        business.id,
        order.id,
        status,
      );
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo cambiar el estado.",
      );
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Pedidos recibidos</h1>

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
      ) : orders.length === 0 ? (
        <p className="mt-4 text-neutral-500">No hay pedidos con ese filtro.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {orders.map((order) => {
            const next = NEXT_STATUS[order.status];
            const showCancel =
              order.status !== "delivered" && order.status !== "cancelled";
            return (
              <div
                key={order.id}
                className="rounded-lg border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">
                      Pedido #{order.id} — {order.customer}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-semibold text-neutral-800">
                      ${order.total.toFixed(2)}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                </div>

                {order.items && (
                  <ul className="mt-2 text-sm text-neutral-600">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.quantity}× {item.name}
                      </li>
                    ))}
                  </ul>
                )}

                {(next || showCancel) && (
                  <div className="mt-3 flex gap-2">
                    {next && (
                      <Button
                        loading={actingId === order.id}
                        onClick={() => changeStatus(order, next.status)}
                      >
                        {next.label}
                      </Button>
                    )}
                    {showCancel && (
                      <Button
                        variant="danger"
                        loading={actingId === order.id}
                        onClick={() => changeStatus(order, "cancelled")}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
