"use client";

import { CloseIcon, PinIcon } from "@/src/components/business/icons";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner, TextField } from "@/src/components/ui/field";
import type { OrderDetail } from "@/src/types";

export function CartDrawer({
  open,
  onClose,
  cartOrder,
  cartError,
  showDeliveryForm,
  deliveryAddress,
  onDeliveryAddressChange,
  deliveryLat,
  onDeliveryLatChange,
  deliveryLng,
  onDeliveryLngChange,
  onUseMyLocation,
  onConfirmDeliveryAndAdd,
  addingProductId,
  pendingProductId,
  calculatedDeliveryFee,
  onConfirmOrder,
  onCancelCart,
  canceling,
}: {
  open: boolean;
  onClose: () => void;
  cartOrder: OrderDetail | null;
  cartError: string | null;
  showDeliveryForm: boolean;
  deliveryAddress: string;
  onDeliveryAddressChange: (value: string) => void;
  deliveryLat: string;
  onDeliveryLatChange: (value: string) => void;
  deliveryLng: string;
  onDeliveryLngChange: (value: string) => void;
  onUseMyLocation: () => void;
  onConfirmDeliveryAndAdd: () => void;
  addingProductId: number | null;
  pendingProductId: number | null;
  calculatedDeliveryFee: number | null;
  onConfirmOrder: () => void;
  onCancelCart: () => void;
  canceling: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
      />

      <div className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="font-serif text-lg text-neutral-900">Tu pedido</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cartError && (
            <div className="mb-3">
              <ErrorBanner message={cartError} />
            </div>
          )}

          {showDeliveryForm && (
            <div className="flex flex-col gap-3 rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">
                Contanos dónde entregamos (se pide una sola vez por negocio).
              </p>
              <TextField
                id="delivery_address"
                label="Dirección"
                value={deliveryAddress}
                onChange={(e) => onDeliveryAddressChange(e.target.value)}
              />
              <div className="flex gap-2">
                <TextField
                  id="delivery_lat"
                  label="Latitud"
                  value={deliveryLat}
                  onChange={(e) => onDeliveryLatChange(e.target.value)}
                />
                <TextField
                  id="delivery_lng"
                  label="Longitud"
                  value={deliveryLng}
                  onChange={(e) => onDeliveryLngChange(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={onUseMyLocation}
                className="flex w-fit items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline"
              >
                <PinIcon />
                Usar mi ubicación actual
              </button>
              <Button
                className="mt-1"
                loading={addingProductId === pendingProductId}
                onClick={onConfirmDeliveryAndAdd}
              >
                Confirmar dirección y agregar
              </Button>
            </div>
          )}

          {cartOrder && !showDeliveryForm && (
            <>
              <div className="divide-y divide-neutral-100">
                {cartOrder.items?.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex justify-between py-2 text-sm text-neutral-500"
                  >
                    <span>
                      {item.quantity}× {item.name}
                    </span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal productos</span>
                  <span>${(cartOrder.total || 0).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-neutral-500">
                  <span>Costo de envío</span>
                  {(calculatedDeliveryFee ?? cartOrder.delivery_fee) ===
                  null ? (
                    <span className="text-red-600">Fuera de rango</span>
                  ) : (calculatedDeliveryFee ?? cartOrder.delivery_fee) ===
                    0 ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      ¡Gratis!
                    </span>
                  ) : (
                    <span>
                      $
                      {(
                        calculatedDeliveryFee ?? cartOrder.delivery_fee
                      ).toFixed(2)}
                    </span>
                  )}
                </div>

                {cartOrder.discount && cartOrder.discount > 0 && (
                  <div className="flex justify-between font-medium text-emerald-600">
                    <span>Descuento aplicado</span>
                    <span>-${cartOrder.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-neutral-200 pt-3 text-lg font-bold text-neutral-900">
                  <span>Total a pagar</span>
                  <span>
                    ${(cartOrder.total_with_delivery || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}

          {!cartOrder && !showDeliveryForm && (
            <p className="text-sm text-neutral-500">
              Todavía no agregaste productos.
            </p>
          )}
        </div>

        {cartOrder && !showDeliveryForm && (
          <div className="flex gap-2 border-t border-neutral-200 px-5 py-4">
            <Button className="flex-1" onClick={onConfirmOrder}>
              Confirmar pedido
            </Button>
            <Button variant="ghost" onClick={onCancelCart} loading={canceling}>
              Vaciar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}