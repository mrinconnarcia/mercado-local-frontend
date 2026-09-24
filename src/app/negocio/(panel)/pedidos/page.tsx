"use client";

import { useEffect, useState } from "react";
import { businessOrdersApi } from "@/src/lib/endpoints";
import { useBusinessPanel } from "@/src/lib/business-context";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner } from "@/src/components/ui/field";
import { OrderStatusBadge } from "@/src/components/order-status-badge";
import type { BusinessOrder, OrderStatus } from "@/src/types";

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
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
      <h1 className="font-serif text-2xl text-neutral-900">
        Pedidos recibidos
      </h1>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-emerald-700 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
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
        <div className="mt-4 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-neutral-100"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="mt-4 text-neutral-500">No hay pedidos con ese filtro.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {orders.map((order) => {
            const next = NEXT_STATUS[order.status];
            const showCancel =
              order.status !== "delivered" && order.status !== "cancelled";
            const isExpanded = expandedId === order.id;
            const total = order.total_with_delivery ?? order.total;

            return (
              <div
                key={order.id}
                className="rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-neutral-900">
                      Pedido #{order.id} — {order.customer}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-semibold text-neutral-900">
                      ${total.toFixed(2)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="mt-2 text-xs font-medium text-emerald-700 hover:underline"
                  >
                    {isExpanded ? "Ocultar detalles" : "Ver detalles"}
                  </button>
                )}

                {isExpanded && order.items && (
                  <div className="mt-3 border-t border-neutral-100 pt-3">
                    <ul className="space-y-1 text-sm text-neutral-600">
                      {order.items.map((item, i) => (
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

                    <div className="mt-3 space-y-1 border-t border-neutral-100 pt-2 text-sm">
                      <div className="flex justify-between text-neutral-500">
                        <span>Subtotal productos</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                      {order.delivery_fee != null && (
                        <div className="flex justify-between text-neutral-500">
                          <span>Envío</span>
                          <span
                            className={
                              order.delivery_fee === 0
                                ? "font-medium text-emerald-600"
                                : ""
                            }
                          >
                            {order.delivery_fee === 0
                              ? "¡Gratis!"
                              : `$${order.delivery_fee.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                      {order.discount && order.discount > 0 && (
                        <div className="flex justify-between font-medium text-emerald-600">
                          <span>Descuento</span>
                          <span>-${order.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-neutral-200 pt-1 font-semibold text-neutral-900">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
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
