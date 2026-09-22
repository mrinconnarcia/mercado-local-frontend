"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ordersApi } from "@/src/lib/endpoints";
import { useRequireRole } from "@/src/lib/use-require-role";
import { ApiError } from "@/src/lib/api";
import { OrderStatusBadge } from "@/src/components/order-status-badge";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner, TextareaField } from "@/src/components/ui/field";
import type { OrderDetail } from "@/src/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ready } = useRequireRole(["customer"]);

  const [order, setOrder] = useState<OrderDetail | null>(null);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  if (!ready || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-neutral-200" />
          <div className="h-32 rounded-xl bg-neutral-100" />
        </div>
      </div>
    );
  }
  if (error && !order)
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <ErrorBanner message={error} />
      </div>
    );
  if (!order) return null;

  const canCancel =
    order.status !== "delivered" && order.status !== "cancelled";
  const canReview = order.status === "delivered" && !reviewSent;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-neutral-900">
          Pedido #{order.id}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        {order.business.toString()}
      </p>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mt-6 divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
        {order.items.map((item) => (
          <div
            key={item.product_id}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span className="text-neutral-600">
              {item.quantity}× {item.name}
            </span>
            <span className="text-neutral-600">
              ${item.subtotal.toFixed(2)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <span className="text-neutral-500">Envío</span>
          <span className="text-neutral-600">
            ${order.delivery_fee.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-b-xl bg-neutral-50 px-4 py-3 font-semibold">
          <span className="text-neutral-700">Total</span>
          <span className="text-neutral-900">
            ${order.total_with_delivery.toFixed(2)}
          </span>
        </div>
      </div>

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
        <div className="mt-8 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckIcon />
          ¡Gracias por tu reseña!
        </div>
      )}

      {canReview && (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="font-serif text-lg text-neutral-900">
            Dejar una reseña
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <p className="mb-1.5 text-sm font-medium text-neutral-700">
                Tu calificación
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
                    className="p-0.5 text-amber-400 transition-transform hover:scale-110"
                  >
                    <StarIcon filled={n <= rating} className="h-7 w-7" />
                  </button>
                ))}
              </div>
            </div>
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

function StarIcon({
  filled,
  className = "h-4 w-4",
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17.3 5.7 20.8l1.7-6.9L2 9.2l7.1-.6L12 2Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 shrink-0"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
