"use client";

import { Button } from "@/src/components/ui/button";
import type { Product } from "@/src/types";

export function ProductCard({
  product,
  quantity,
  onQuantityChange,
  onAdd,
  adding,
  showControls,
}: {
  product: Product;
  quantity: number;
  onQuantityChange: (value: number) => void;
  onAdd: () => void;
  adding: boolean;
  showControls: boolean;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm hover:shadow-neutral-900/5">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="mb-3 h-32 w-full rounded-lg object-cover"
        />
      )}
      <h3 className="font-medium text-neutral-900">{product.name}</h3>
      {product.description && (
        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
          {product.description}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-base font-semibold text-emerald-700">
          ${product.price.toFixed(2)}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            product.available
              ? "bg-neutral-100 text-neutral-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {product.available ? `Stock: ${product.stock}` : "No disponible"}
        </span>
      </div>

      {showControls && product.available && (
        <div className="mt-3 flex flex-col gap-2 border-t border-neutral-100 pt-3">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Disminuir cantidad"
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 text-lg font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-40"
            >
              −
            </button>
            <span className="w-8 text-center font-medium text-neutral-900">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={quantity >= product.stock}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 text-lg font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-40"
            >
              +
            </button>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            loading={adding}
            onClick={onAdd}
          >
            Agregar al pedido
          </Button>
        </div>
      )}
    </div>
  );
}