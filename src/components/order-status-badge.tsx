import type { OrderStatus } from "@/src/types";

const LABELS: Record<OrderStatus, string> = {
  pending: "Carrito",
  confirmed: "Confirmado",
  accepted: "Aceptado",
  preparing: "Preparando",
  on_the_way: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const COLORS: Record<OrderStatus, string> = {
  pending: "bg-neutral-100 text-neutral-700",
  confirmed: "bg-blue-100 text-blue-700",
  accepted: "bg-blue-100 text-blue-700",
  preparing: "bg-amber-100 text-amber-700",
  on_the_way: "bg-amber-100 text-amber-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
