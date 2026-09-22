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

  const visibleOrders = orders.filter((o) => o.status !== "pending");

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-40 rounded bg-neutral-200" />
          <div className="h-20 rounded-xl bg-neutral-100" />
          <div className="h-20 rounded-xl bg-neutral-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-2xl text-neutral-900">Mis pedidos</h1>

      {loading ? (
        <div className="mt-4 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-neutral-100"
            />
          ))}
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-12 text-center">
          <BagIcon />
          <p className="text-neutral-500">Todavía no hiciste ningún pedido.</p>
          <Link
            href="/"
            className="mt-1 text-sm font-medium text-emerald-700 hover:underline"
          >
            Ver negocios cerca tuyo
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {visibleOrders.map((order) => (
            <Link
              key={order.id}
              href={`/cuenta/pedidos/${order.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md hover:shadow-neutral-900/5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                  <BagIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium text-neutral-900">
                    {typeof order.business === "object"
                      ? order.business.name
                      : `Negocio #${order.id}`}
                  </p>
                  <p className="text-xs text-neutral-500">Pedido #{order.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
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

function BagIcon({
  className = "h-8 w-8 text-neutral-300",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 7h12l1 13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L6 7Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}
