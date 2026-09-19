"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ordersApi } from "@/src/lib/endpoints";
import { useRequireRole } from "@/src/lib/use-require-role";
import { ApiError } from "@/src/lib/api";
import { OrderStatusBadge } from "@/src/components/order-status-badge";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner, TextareaField } from "@/src/components/ui/field";
import type { Order } from "@/src/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ready } = useRequireRole(["customer"]);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = () => {
    setLoading(true);
    ordersApi
      .get(id)
      .then(setOrder)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudo cargar el pedido.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (ready) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, id]);

  const handleCancel = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      setOrder(await ordersApi.cancel(order.id));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo cancelar el pedido.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async () => {
    if (!order) return;
    setActionLoading(true);
    setError(null);
    try {
      await ordersApi.review(order.id, {
        rating,
        comment: comment || undefined,
      });
      setReviewSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo enviar la reseña.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (!ready || loading)
    return <p className="px-4 py-8 text-neutral-500">Cargando...</p>;
  if (error && !order)
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <ErrorBanner message={error} />
      </div>
    );
  if (!order) return null;

  const canCancel = ["pending", "confirmed", "accepted"].includes(order.status);
  const canReview = order.status === "delivered" && !reviewSent;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">
          Pedido #{order.id}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        {order.business?.name ?? `Negocio #${order.business_id}`}
      </p>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        {order.order_items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span>
              {item.quantity}×{" "}
              {item.product?.name ?? `Producto #${item.product_id}`}
            </span>
            <span className="text-neutral-600">
              ${Number(item.subtotal ?? item.unit_price).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-neutral-500">Envío</span>
          <span>${Number(order.delivery_fee ?? 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 font-semibold">
          <span>Total</span>
          <span>${Number(order.total ?? 0).toFixed(2)}</span>
        </div>
      </div>

      {order.delivery_address && (
        <p className="mt-4 text-sm text-neutral-500">
          Entrega en: {order.delivery_address}
        </p>
      )}

      {canCancel && (
        <div className="mt-6">
          <Button
            variant="danger"
            onClick={handleCancel}
            loading={actionLoading}
          >
            Cancelar pedido
          </Button>
        </div>
      )}

      {reviewSent && (
        <p className="mt-8 text-sm text-emerald-700">¡Gracias por tu reseña!</p>
      )}

      {canReview && (
        <div className="mt-8 border-t border-neutral-200 pt-6">
          <h2 className="font-semibold text-neutral-900">Dejar una reseña</h2>
          <div className="mt-3 flex flex-col gap-3">
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-32 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} estrella{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <TextareaField
              id="comment"
              label="Comentario (opcional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleReview}
              loading={actionLoading}
              className="w-fit"
            >
              Enviar reseña
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
