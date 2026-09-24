"use client";

import { ShoppingBag } from "lucide-react";
import type { OrderDetail } from "@/src/types";

export function CartFab({
  cartOrder,
  onClick,
}: {
  cartOrder: OrderDetail | null;
  onClick: () => void;
}) {
  const itemCount =
    cartOrder?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  if (!cartOrder || itemCount === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-emerald-700 py-3 pl-4 pr-5 text-white shadow-lg shadow-emerald-900/20 transition-transform hover:scale-[1.03] hover:bg-emerald-800 active:scale-100"
    >
      <span className="relative">
        <ShoppingBag className="h-5 w-5" />
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-emerald-700">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      </span>
      <span className="text-sm font-semibold">
        ${(cartOrder.total_with_delivery || cartOrder.total || 0).toFixed(2)}
      </span>
    </button>
  );
}
