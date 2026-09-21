"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { businessesApi, ordersApi, productsApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { useAuth } from "@/src/lib/auth-context";
import {
  clearCartOrderId,
  getCartOrderId,
  setCartOrderId,
} from "@/src/lib/cart-storage";
import { ErrorBanner, TextField } from "@/src/components/ui/field";
import { Button } from "@/src/components/ui/button";
import type { Business, OrderDetail, Product } from "@/src/types";

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cartOrder, setCartOrderState] = useState<OrderDetail | null>(null);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLat, setDeliveryLat] = useState("");
  const [deliveryLng, setDeliveryLng] = useState("");
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([businessesApi.get(id), productsApi.listByBusiness(id)])
      .then(([b, p]) => {
        setBusiness(b);
        setProducts(p.data);
      })
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudo cargar el negocio.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== "customer") return;
    const orderId = getCartOrderId(id);
    if (!orderId) return;
    ordersApi
      .get(orderId)
      .then((order) => {
        if (order.status === "pending") setCartOrderState(order);
        else clearCartOrderId(id);
      })
      .catch(() => clearCartOrderId(id));
  }, [id, user]);

  const addProduct = async (productId: number) => {
    setCartError(null);
    setAddingProductId(productId);
    try {
      if (cartOrder) {
        const updated = await ordersApi.addItem(cartOrder.id, {
          product_id: productId,
          quantity: 1,
        });
        setCartOrderState(updated);
      } else {
        setPendingProductId(productId);
        setShowDeliveryForm(true);
      }
    } catch (err) {
      setCartError(
        err instanceof ApiError
          ? err.message
          : "No se pudo agregar el producto.",
      );
    } finally {
      setAddingProductId(null);
    }
  };

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setDeliveryLat(String(pos.coords.latitude));
      setDeliveryLng(String(pos.coords.longitude));
    });
  };

  const createCartAndAdd = async () => {
    if (pendingProductId == null) return;
    setCartError(null);
    setAddingProductId(pendingProductId);
    try {
      const order = await ordersApi.createCart(id, {
        delivery_address: deliveryAddress,
        delivery_latitude: deliveryLat,
        delivery_longitude: deliveryLng,
      });
      const updated = await ordersApi.addItem(order.id, {
        product_id: pendingProductId,
        quantity: 1,
      });
      setCartOrderState(updated);
      setCartOrderId(id, updated.id);
      setShowDeliveryForm(false);
      setPendingProductId(null);
    } catch (err) {
      setCartError(
        err instanceof ApiError
          ? err.message
          : "No se pudo crear el pedido. Verificá que el negocio entregue en esa ubicación.",
      );
    } finally {
      setAddingProductId(null);
    }
  };

  const handleConfirm = async () => {
    if (!cartOrder) return;
    setCartError(null);
    try {
      await ordersApi.confirm(cartOrder.id);
      clearCartOrderId(id);
      router.push(`/cuenta/pedidos/${cartOrder.id}`);
    } catch (err) {
      setCartError(
        err instanceof ApiError
          ? err.message
          : "No se pudo confirmar el pedido.",
      );
    }
  };

  const handleCancelCart = async () => {
    if (!cartOrder) return;
    try {
      await ordersApi.cancel(cartOrder.id);
    } finally {
      clearCartOrderId(id);
      setCartOrderState(null);
    }
  };

  if (loading) return <p className="px-4 py-8 text-neutral-500">Cargando...</p>;
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorBanner message={error} />
      </div>
    );
  if (!business) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:grid lg:grid-cols-3 lg:gap-8">
      <div className="lg:col-span-2">
        <div className="border-b border-neutral-200 pb-4">
          <h1 className="text-2xl font-bold text-neutral-900">
            {business.name}
          </h1>
          <p className="text-sm text-neutral-500">{business.category}</p>
          {business.description && (
            <p className="mt-2 text-neutral-700">{business.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-neutral-500">
            {business.address && <span>{business.address}</span>}
            {business.phone && <span>{business.phone}</span>}
            {business.average_rating != null && (
              <span className="text-amber-600">
                ★ {Number(business.average_rating).toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <h2 className="mt-6 text-lg font-semibold text-neutral-900">
          Productos
        </h2>
        {products.length === 0 ? (
          <p className="mt-2 text-neutral-500">
            Este negocio todavía no cargó productos.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-neutral-200 bg-white p-4"
              >
                {product.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="mb-2 h-32 w-full rounded-md object-cover"
                  />
                )}
                <h3 className="font-medium text-neutral-900">{product.name}</h3>
                {product.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                    {product.description}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-emerald-700">
                    ${product.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs ${product.available ? "text-neutral-500" : "text-red-500"}`}
                  >
                    {product.available
                      ? `Stock: ${product.stock}`
                      : "No disponible"}
                  </span>
                </div>
                {user?.role === "customer" && product.available && (
                  <Button
                    variant="secondary"
                    className="mt-3 w-full"
                    loading={addingProductId === product.id}
                    onClick={() => addProduct(product.id)}
                  >
                    Agregar al pedido
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 lg:mt-0">
        {!user && (
          <p className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
            Iniciá sesión como cliente para hacer un pedido.
          </p>
        )}

        {user?.role === "customer" && (
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="font-semibold text-neutral-900">Tu pedido</h2>
            {cartError && (
              <div className="mt-2">
                <ErrorBanner message={cartError} />
              </div>
            )}

            {showDeliveryForm && (
              <div className="mt-3 flex flex-col gap-2 border-t border-neutral-200 pt-3">
                <p className="text-xs text-neutral-500">
                  Contanos dónde entregamos (se pide una sola vez por negocio).
                </p>
                <TextField
                  id="delivery_address"
                  label="Dirección"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
                <div className="flex gap-2">
                  <TextField
                    id="delivery_lat"
                    label="Latitud"
                    value={deliveryLat}
                    onChange={(e) => setDeliveryLat(e.target.value)}
                  />
                  <TextField
                    id="delivery_lng"
                    label="Longitud"
                    value={deliveryLng}
                    onChange={(e) => setDeliveryLng(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="text-left text-xs text-emerald-700 hover:underline"
                >
                  Usar mi ubicación actual
                </button>
                <Button
                  className="mt-1"
                  loading={addingProductId === pendingProductId}
                  onClick={createCartAndAdd}
                >
                  Confirmar dirección y agregar
                </Button>
              </div>
            )}

            {cartOrder && !showDeliveryForm && (
              <>
                <div className="mt-3 divide-y divide-neutral-100">
                  {cartOrder.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex justify-between py-2 text-sm"
                    >
                      <span>
                        {item.quantity}× {item.name}
                      </span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-sm text-neutral-500">
                  <span>Envío</span>
                  <span>${cartOrder.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-neutral-200 pt-2 font-semibold">
                  <span>Total</span>
                  <span>${cartOrder.total_with_delivery.toFixed(2)}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" onClick={handleConfirm}>
                    Confirmar pedido
                  </Button>
                  <Button variant="ghost" onClick={handleCancelCart}>
                    Vaciar
                  </Button>
                </div>
              </>
            )}

            {!cartOrder && !showDeliveryForm && (
              <p className="mt-2 text-sm text-neutral-500">
                Todavía no agregaste productos.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
