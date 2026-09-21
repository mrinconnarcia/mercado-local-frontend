import { apiFetch } from "@/src/lib/api";
import type {
  AdminBusiness,
  AdminOrderDetail,
  AdminOrderListItem,
  AdminStats,
  AdminUser,
  AdminUserDetail,
  AuthResponse,
  Business,
  BusinessHour,
  BusinessOrder,
  BusinessPayload,
  BusinessReviews,
  Category,
  DashboardSummary,
  InventoryItem,
  NotificationsResponse,
  Notification,
  OrderDetail,
  OrderListItem,
  OrderStatus,
  PaginatedResponse,
  Product,
  Review,
  SalesReport,
  User,
  UserRole,
} from "@/src/types";

export const healthApi = {
  check: () => apiFetch<{ status: string }>("/health", { auth: false }),
};

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

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot_password", {
      method: "POST",
      body: { email },
      auth: false,
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch<{ message: string }>("/auth/reset_password", {
      method: "POST",
      body: { token, password },
      auth: false,
    }),
};

export const categoriesApi = {
  list: () => apiFetch<Category[]>("/categories"),
};

export const businessesApi = {
  list: (params?: { category_id?: number; q?: string; status?: string }) =>
    apiFetch<PaginatedResponse<Business>>("/businesses", { params }),

  // NUEVO: reemplaza todo el hack de localStorage.
  mine: () => apiFetch<Business[]>("/businesses/mine"),

  get: (id: number | string) => apiFetch<Business>(`/businesses/${id}`),
  create: (payload: BusinessPayload) =>
    apiFetch<Business>("/businesses", {
      method: "POST",
      body: { business: payload },
    }),
  update: (id: number | string, payload: BusinessPayload) =>
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
    apiFetch<{ delivers: boolean; distance_km: number; estimated_fee: number }>(
      `/businesses/${id}/delivery_check`,
      {
        params: { lat, lng },
      },
    ),
};

export const productsApi = {
  listByBusiness: (businessId: number | string) =>
    apiFetch<PaginatedResponse<Product>>(`/businesses/${businessId}/products`),
  get: (id: number | string) => apiFetch<Product>(`/products/${id}`),
  create: (businessId: number | string, formData: FormData) =>
    apiFetch<Product>(`/businesses/${businessId}/products`, {
      method: "POST",
      formData,
    }),
  update: (id: number | string, formData: FormData) =>
    apiFetch<Product>(`/products/${id}`, { method: "PATCH", formData }),
  remove: (id: number | string) =>
    apiFetch<void>(`/products/${id}`, { method: "DELETE" }),
};

export const ordersApi = {
  list: () => apiFetch<PaginatedResponse<OrderListItem>>("/orders"),
  get: (id: number | string) => apiFetch<OrderDetail>(`/orders/${id}`),
  createCart: (
    businessId: number | string,
    payload: {
      delivery_address: string;
      delivery_latitude: string;
      delivery_longitude: string;
    },
  ) =>
    apiFetch<OrderDetail>(`/businesses/${businessId}/orders`, {
      method: "POST",
      body: payload,
    }),
  addItem: (
    orderId: number | string,
    payload: { product_id: number; quantity: number },
  ) =>
    apiFetch<OrderDetail>(`/orders/${orderId}/add_item`, {
      method: "PATCH",
      body: payload,
    }),
  confirm: (orderId: number | string) =>
    apiFetch<OrderDetail>(`/orders/${orderId}/confirm`, { method: "PATCH" }),
  cancel: (orderId: number | string) =>
    apiFetch<OrderDetail>(`/orders/${orderId}/cancel`, { method: "PATCH" }),
  review: (
    orderId: number | string,
    payload: { rating: number; comment?: string },
  ) =>
    apiFetch<Review>(`/orders/${orderId}/review`, {
      method: "POST",
      body: payload,
    }),
};

export const businessOrdersApi = {
  listForBusiness: (
    businessId: number | string,
    params?: { status?: OrderStatus },
  ) =>
    apiFetch<BusinessOrder[]>(`/businesses/${businessId}/orders`, { params }),
  updateStatus: (
    businessId: number | string,
    orderId: number | string,
    status: OrderStatus,
  ) =>
    apiFetch<BusinessOrder>(
      `/businesses/${businessId}/orders/${orderId}/update_status`,
      {
        method: "PATCH",
        body: { status },
      },
    ),
};

export const businessPanelApi = {
  dashboard: (businessId: number | string) =>
    apiFetch<DashboardSummary>(`/businesses/${businessId}/dashboard`),
  sales: (
    businessId: number | string,
    params?: { from?: string; to?: string },
  ) => apiFetch<SalesReport>(`/businesses/${businessId}/sales`, { params }),
  inventory: (businessId: number | string) =>
    apiFetch<InventoryItem[]>(`/businesses/${businessId}/inventory`),
  updateInventory: (
    businessId: number | string,
    productId: number | string,
    payload: { stock?: number; available?: boolean },
  ) =>
    apiFetch<InventoryItem>(
      `/businesses/${businessId}/inventory/${productId}`,
      {
        method: "PATCH",
        body: { product: payload },
      },
    ),
  getHours: (businessId: number | string) =>
    apiFetch<BusinessHour[]>(`/businesses/${businessId}/business_hours`),
  setHours: (businessId: number | string, hours: BusinessHour[]) =>
    apiFetch<BusinessHour[]>(`/businesses/${businessId}/business_hours`, {
      method: "PUT",
      body: { business_hours: hours },
    }),
};

export const adminApi = {
  listBusinesses: (params?: { status?: string }) =>
    apiFetch<PaginatedResponse<AdminBusiness>>("/admin/businesses", { params }),
  approveBusiness: (id: number | string) =>
    apiFetch<AdminBusiness>(`/admin/businesses/${id}/approve`, {
      method: "PATCH",
    }),
  suspendBusiness: (id: number | string) =>
    apiFetch<AdminBusiness>(`/admin/businesses/${id}/suspend`, {
      method: "PATCH",
    }),
  reactivateBusiness: (id: number | string) =>
    apiFetch<AdminBusiness>(`/admin/businesses/${id}/reactivate`, {
      method: "PATCH",
    }),
  listUsers: (params?: { role?: string; q?: string }) =>
    apiFetch<AdminUser[]>("/admin/users", { params }),
  getUser: (id: number | string) =>
    apiFetch<AdminUserDetail>(`/admin/users/${id}`),
  toggleUserActive: (id: number | string) =>
    apiFetch<AdminUser>(`/admin/users/${id}/toggle_active`, {
      method: "PATCH",
    }),
  listOrders: (params?: { status?: string; business_id?: number | string }) =>
    apiFetch<PaginatedResponse<AdminOrderListItem>>("/admin/orders", {
      params,
    }),
  getOrder: (id: number | string) =>
    apiFetch<AdminOrderDetail>(`/admin/orders/${id}`),
  stats: () => apiFetch<AdminStats>("/admin/stats"),
};

export const notificationsApi = {
  list: (params?: { unread?: boolean }) =>
    apiFetch<NotificationsResponse>("/notifications", { params }),
  markRead: (id: number | string) =>
    apiFetch<Notification>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    apiFetch<{ message: string; unread_count: number }>(
      "/notifications/read_all",
      { method: "PATCH" },
    ),
};

export const reviewsApi = {
  listForBusiness: (businessId: number | string) =>
    apiFetch<BusinessReviews>(`/businesses/${businessId}/reviews`),
};
