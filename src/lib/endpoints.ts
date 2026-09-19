import { apiFetch } from "@/src/lib/api";
import type {
  AdminStats,
  AuthResponse,
  Business,
  BusinessHour,
  Category,
  DashboardSummary,
  Notification,
  Order,
  OrderStatus,
  Product,
  Review,
  User,
  UserRole,
} from "@/src/types";

// ---------- 0. Health ----------
export const healthApi = {
  check: () => apiFetch<{ status: string }>("/health", { auth: false }),
};

// ---------- 1. Auth ----------
export const authApi = {
  register: (payload: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: { user: payload },
      auth: false,
    }),

  login: (payload: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  me: () => apiFetch<User>("/me"),

  logout: () => apiFetch<void>("/logout", { method: "DELETE" }),
};

// ---------- 2. Categorías ----------
export const categoriesApi = {
  list: () => apiFetch<Category[]>("/categories", { auth: false }),
};

// ---------- 3. Negocios ----------
export const businessesApi = {
  list: (params?: { category_id?: number; q?: string; status?: string }) =>
    apiFetch<Business[]>("/businesses", { params, auth: false }),

  get: (id: number | string) =>
    apiFetch<Business>(`/businesses/${id}`, { auth: false }),

  create: (payload: Partial<Business>) =>
    apiFetch<Business>("/businesses", {
      method: "POST",
      body: { business: payload },
    }),

  update: (id: number | string, payload: Partial<Business>) =>
    apiFetch<Business>(`/businesses/${id}`, {
      method: "PATCH",
      body: { business: payload },
    }),

  toggleActive: (id: number | string) =>
    apiFetch<Business>(`/businesses/${id}/toggle_active`, { method: "PATCH" }),

  deliveryCheck: (
    id: number | string,
    lat: number | string,
    lng: number | string,
  ) =>
    apiFetch<{ deliverable: boolean; [key: string]: unknown }>(
      `/businesses/${id}/delivery_check`,
      {
        params: { lat, lng },
        auth: false,
      },
    ),
};

// ---------- 4. Productos ----------
export const productsApi = {
  listByBusiness: (businessId: number | string) =>
    apiFetch<Product[]>(`/businesses/${businessId}/products`, { auth: false }),

  get: (id: number | string) =>
    apiFetch<Product>(`/products/${id}`, { auth: false }),

  /** payload como FormData porque el backend acepta imagen (multipart/form-data). */
  create: (businessId: number | string, formData: FormData) =>
    apiFetch<Product>(`/businesses/${businessId}/products`, {
      method: "POST",
      formData,
    }),

  update: (id: number | string, payload: Partial<Product> | FormData) =>
    apiFetch<Product>(`/products/${id}`, {
      method: "PATCH",
      ...(payload instanceof FormData
        ? { formData: payload }
        : { body: { product: payload } }),
    }),

  remove: (id: number | string) =>
    apiFetch<void>(`/products/${id}`, { method: "DELETE" }),
};

// ---------- 5. Pedidos (cliente) ----------
export const ordersApi = {
  list: () => apiFetch<Order[]>("/orders"),

  get: (id: number | string) => apiFetch<Order>(`/orders/${id}`),

  createCart: (
    businessId: number | string,
    payload: {
      delivery_address: string;
      delivery_latitude: string;
      delivery_longitude: string;
    },
  ) =>
    apiFetch<Order>(`/businesses/${businessId}/orders`, {
      method: "POST",
      body: payload,
    }),

  addItem: (
    orderId: number | string,
    payload: { product_id: number; quantity: number },
  ) =>
    apiFetch<Order>(`/orders/${orderId}/add_item`, {
      method: "PATCH",
      body: payload,
    }),

  confirm: (orderId: number | string) =>
    apiFetch<Order>(`/orders/${orderId}/confirm`, { method: "PATCH" }),

  cancel: (orderId: number | string) =>
    apiFetch<Order>(`/orders/${orderId}/cancel`, { method: "PATCH" }),

  review: (
    orderId: number | string,
    payload: { rating: number; comment?: string },
  ) =>
    apiFetch<Review>(`/orders/${orderId}/review`, {
      method: "POST",
      body: payload,
    }),
};

// ---------- 6. Pedidos (negocio) ----------
export const businessOrdersApi = {
  listForBusiness: (
    businessId: number | string,
    params?: { status?: OrderStatus | string },
  ) => apiFetch<Order[]>(`/businesses/${businessId}/orders`, { params }),

  updateStatus: (
    businessId: number | string,
    orderId: number | string,
    status: OrderStatus | string,
  ) =>
    apiFetch<Order>(
      `/businesses/${businessId}/orders/${orderId}/update_status`,
      {
        method: "PATCH",
        body: { status },
      },
    ),
};

// ---------- 7. Panel del negocio ----------
export const businessPanelApi = {
  dashboard: (businessId: number | string) =>
    apiFetch<DashboardSummary>(`/businesses/${businessId}/dashboard`),

  sales: (
    businessId: number | string,
    params?: { from?: string; to?: string },
  ) => apiFetch<unknown>(`/businesses/${businessId}/sales`, { params }),

  inventory: (businessId: number | string) =>
    apiFetch<Product[]>(`/businesses/${businessId}/inventory`),

  updateInventory: (
    businessId: number | string,
    productId: number | string,
    payload: { stock?: number; available?: boolean },
  ) =>
    apiFetch<Product>(`/businesses/${businessId}/inventory/${productId}`, {
      method: "PATCH",
      body: { product: payload },
    }),

  getHours: (businessId: number | string) =>
    apiFetch<BusinessHour[]>(`/businesses/${businessId}/business_hours`),

  setHours: (businessId: number | string, hours: BusinessHour[]) =>
    apiFetch<BusinessHour[]>(`/businesses/${businessId}/business_hours`, {
      method: "PUT",
      body: { business_hours: hours },
    }),

  updateDeliveryConfig: (
    businessId: number | string,
    payload: {
      latitude?: string;
      longitude?: string;
      delivery_radius_km?: number;
      delivery_base_fee?: number;
      delivery_fee_per_km?: number;
      free_delivery_over?: number;
    },
  ) => businessesApi.update(businessId, payload),
};

// ---------- 8. Administración ----------
export const adminApi = {
  listBusinesses: (params?: { status?: string }) =>
    apiFetch<Business[]>("/admin/businesses", { params }),

  approveBusiness: (id: number | string) =>
    apiFetch<Business>(`/admin/businesses/${id}/approve`, { method: "PATCH" }),

  suspendBusiness: (id: number | string) =>
    apiFetch<Business>(`/admin/businesses/${id}/suspend`, { method: "PATCH" }),

  reactivateBusiness: (id: number | string) =>
    apiFetch<Business>(`/admin/businesses/${id}/reactivate`, {
      method: "PATCH",
    }),

  listUsers: (params?: { role?: string; q?: string }) =>
    apiFetch<User[]>("/admin/users", { params }),

  getUser: (id: number | string) => apiFetch<User>(`/admin/users/${id}`),

  toggleUserActive: (id: number | string) =>
    apiFetch<User>(`/admin/users/${id}/toggle_active`, { method: "PATCH" }),

  listOrders: (params?: { status?: string; business_id?: number | string }) =>
    apiFetch<Order[]>("/admin/orders", { params }),

  getOrder: (id: number | string) => apiFetch<Order>(`/admin/orders/${id}`),

  stats: () => apiFetch<AdminStats>("/admin/stats"),
};

// ---------- 9. Notificaciones ----------
export const notificationsApi = {
  list: (params?: { unread?: boolean }) =>
    apiFetch<Notification[]>("/notifications", { params }),

  markRead: (id: number | string) =>
    apiFetch<Notification>(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    apiFetch<void>("/notifications/read_all", { method: "PATCH" }),
};

// ---------- 10. Reseñas ----------
export const reviewsApi = {
  listForBusiness: (businessId: number | string) =>
    apiFetch<Review[]>(`/businesses/${businessId}/reviews`, { auth: false }),
};
