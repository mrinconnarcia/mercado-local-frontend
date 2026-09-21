// Guardamos, por negocio, el id del pedido "carrito" (estado pending) en curso.
// Así si el usuario recarga la página no lo pierde.
const KEY = "ml_cart_orders";

type CartMap = Record<string, number>;

function readMap(): CartMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getCartOrderId(businessId: number | string): number | null {
  return readMap()[String(businessId)] ?? null;
}

export function setCartOrderId(
  businessId: number | string,
  orderId: number,
): void {
  const map = readMap();
  map[String(businessId)] = orderId;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

export function clearCartOrderId(businessId: number | string): void {
  const map = readMap();
  delete map[String(businessId)];
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

/** Todos los order_id "en curso" (no confirmados) guardados localmente, de cualquier negocio. */
export function getAllActiveCartOrderIds(): number[] {
  return Object.values(readMap());
}