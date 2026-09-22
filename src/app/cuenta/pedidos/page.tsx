"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ordersApi } from "@/src/lib/endpoints";
import { useRequireRole } from "@/src/lib/use-require-role";
import { OrderStatusBadge } from "@/src/components/order-status-badge";
import type { OrderListItem } from "@/src/types";

export default function MyOrdersPage() {
  const { ready } = useRequireRole(["customer"]);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    ordersApi
      .list()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setOrders(list);
      })
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return <p className="px-4 py-8 text-neutral-500">Cargando...</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">Mis pedidos</h1>

      {loading ? (
        <p className="mt-4 text-neutral-500">Cargando...</p>
      ) : orders.filter((o) => o.status !== "pending").length === 0 ? (
        <p className="mt-4 text-neutral-500">
          Todavía no hiciste ningún pedido.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {orders
            .filter((o) => o.status !== "pending")
            .map((order) => (
              <Link
                key={order.id}
                href={`/cuenta/pedidos/${order.id}`}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 hover:shadow-sm"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {typeof order.business === "object"
                      ? order.business.name
                      : `Negocio #${order.id}`}
                  </p>
                  <p className="text-xs text-neutral-500">Pedido #{order.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* ✅ CAMBIO: Mostrar total con envío */}
                  <div className="text-right">
                    <span className="block font-semibold text-neutral-800">
                      ${(order.total_with_delivery ?? order.total).toFixed(2)}
                    </span>
                    {order.discount && order.discount > 0 && (
                      <span className="block text-xs text-emerald-600">
                        Con descuento
                      </span>
                    )}
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
