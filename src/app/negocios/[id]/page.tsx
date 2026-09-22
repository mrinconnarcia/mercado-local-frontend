"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { businessesApi, ordersApi, productsApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { useAuth } from "@/src/lib/auth-context";
import {
  clearCartOrderId,
  getCartOrderId,
  setCartOrderId,
} from "@/src/lib/cart-storage";
import { ErrorBanner } from "@/src/components/ui/field";
import { BusinessHeader } from "@/src/components/business/business-header";
import { ProductCard } from "@/src/components/business/product-card";
import { CartFab } from "@/src/components/business/cart-fab";
import { CartDrawer } from "@/src/components/business/cart-drawer";
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
  const [canceling, setCanceling] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const addingRef = useRef(false);

  const [cartOpen, setCartOpen] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLat, setDeliveryLat] = useState("");
  const [deliveryLng, setDeliveryLng] = useState("");
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [pendingQuantity, setPendingQuantity] = useState(1);

  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState<
    number | null
  >(null);

  const getQty = (productId: number) => quantities[productId] ?? 1;
  const setQty = (productId: number, value: number, max: number) =>
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.min(Math.max(1, value), max),
    }));

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

  useEffect(() => {
    if (!cartOrder || !business) return;

    // Si el backend ya calculó y envió un delivery_fee > 0, úsalo directamente
    if (cartOrder.delivery_fee > 0) {
      setCalculatedDeliveryFee(cartOrder.delivery_fee);
      return;
    }

    // Si no, calcúlalo en el frontend
    const lat = parseFloat(deliveryLat);
    const lng = parseFloat(deliveryLng);
    const bizLat = parseFloat(String(business.latitude));
    const bizLng = parseFloat(String(business.longitude));

    if (isNaN(lat) || isNaN(lng) || isNaN(bizLat) || isNaN(bizLng)) {
      setCalculatedDeliveryFee(0);
      return;
    }

    // Fórmula de Haversine
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((bizLat - lat) * Math.PI) / 180;
    const dLon = ((bizLng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((bizLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Verificar si está dentro del radio
    if (distance > (business.delivery_radius_km || 0)) {
      setCalculatedDeliveryFee(null); // Fuera de rango
      return;
    }

    // Calcular costo
    const baseFee = business.delivery_base_fee || 0;
    const perKm = business.delivery_fee_per_km || 0;
    const fee = baseFee + distance * perKm;

    // Verificar si es gratis por monto
    const subtotal =
      cartOrder.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
    const freeOver = business.free_delivery_over || 0;
    const finalFee = freeOver > 0 && subtotal >= freeOver ? 0 : fee;

    setCalculatedDeliveryFee(finalFee);
  }, [cartOrder, business, deliveryLat, deliveryLng]);

  const addProduct = async (productId: number) => {
    setCartError(null);
    setAddingProductId(productId);
    const qty = getQty(productId);
    try {
      if (cartOrder) {
        const updated = await ordersApi.addItem(cartOrder.id, {
          product_id: productId,
          quantity: qty,
        });
        setCartOrderState(updated);
        setCartOpen(true);
      } else {
        setPendingProductId(productId);
        setPendingQuantity(qty);
        setShowDeliveryForm(true);
        setCartOpen(true);
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
    if (pendingProductId == null || addingRef.current) return;
    addingRef.current = true;

    setCartError(null);
    const productToAdd = pendingProductId;
    const qtyToAdd = pendingQuantity;
    setPendingProductId(null);
    try {
      const order = await ordersApi.createCart(id, {
        delivery_address: deliveryAddress,
        delivery_latitude: deliveryLat,
        delivery_longitude: deliveryLng,
      });

      const updated = await ordersApi.addItem(order.id, {
        product_id: productToAdd,
        quantity: qtyToAdd,
      });

      setCartOrderState(updated);
      setCartOrderId(id, updated.id);
      setShowDeliveryForm(false);
    } catch (err) {
      setPendingProductId(productToAdd);
      setCartError(
        err instanceof ApiError
          ? err.message
          : "No se pudo crear el pedido. Verificá que el negocio entregue en esa ubicación.",
      );
    } finally {
      addingRef.current = false;
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
    if (!cartOrder || canceling) return;

    setCartError(null);
    setCanceling(true);

    try {
      await ordersApi.cancel(cartOrder.id);
      clearCartOrderId(id);
      setCartOrderState(null);
      setCartOpen(false);
    } catch (err) {
      setCartError(
        err instanceof ApiError
          ? err.message
          : "No se pudo cancelar el pedido.",
      );
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-64 rounded bg-neutral-200" />
          <div className="h-4 w-40 rounded bg-neutral-200" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-neutral-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorBanner message={error} />
      </div>
    );
  if (!business) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <BusinessHeader business={business} />

      {!user && (
        <p className="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
          Iniciá sesión como cliente para hacer un pedido.
        </p>
      )}

      <h2 className="mt-6 font-serif text-lg text-neutral-900">Productos</h2>
      {products.length === 0 ? (
        <p className="mt-2 text-neutral-500">
          Este negocio todavía no cargó productos.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={getQty(product.id)}
              onQuantityChange={(value) =>
                setQty(product.id, value, product.stock)
              }
              onAdd={() => addProduct(product.id)}
              adding={addingProductId === product.id}
              showControls={user?.role === "customer"}
            />
          ))}
        </div>
      )}

      <CartFab cartOrder={cartOrder} onClick={() => setCartOpen(true)} />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartOrder={cartOrder}
        cartError={cartError}
        showDeliveryForm={showDeliveryForm}
        deliveryAddress={deliveryAddress}
        onDeliveryAddressChange={setDeliveryAddress}
        deliveryLat={deliveryLat}
        onDeliveryLatChange={setDeliveryLat}
        deliveryLng={deliveryLng}
        onDeliveryLngChange={setDeliveryLng}
        onUseMyLocation={useMyLocation}
        onConfirmDeliveryAndAdd={createCartAndAdd}
        addingProductId={addingProductId}
        pendingProductId={pendingProductId}
        calculatedDeliveryFee={calculatedDeliveryFee}
        onConfirmOrder={handleConfirm}
        onCancelCart={handleCancelCart}
        canceling={canceling}
      />
    </div>
  );
}