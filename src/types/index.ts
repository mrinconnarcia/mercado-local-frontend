export type UserRole = "customer" | "business_owner" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  active?: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export type BusinessStatus = "pending" | "approved" | "suspended";

export interface Business {
  id: number;
  name: string;
  address: string | null;
  category: string;
  active: boolean;
  status: BusinessStatus;
  open_now: boolean;
  average_rating: number | null;
  reviews_count: number;
  description?: string | null;
  phone?: string | null;
  owner_id?: number;
  delivery_radius_km?: number;
  delivery_base_fee?: number;
  delivery_fee_per_km?: number;
  free_delivery_over?: number;
  discount_percentage?: number;
}

export interface BusinessOrder {
  id: number;
  status: OrderStatus;
  total: number;
  delivery_fee?: number; // ✅ AGREGAR
  total_with_delivery?: number; // ✅ AGREGAR
  discount?: number; // ✅ AGREGAR
  customer: string;
  created_at: string;
  items?: BusinessOrderItem[];
}

export interface BusinessPayload {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  category_id?: number;
  latitude?: string | number;
  longitude?: string | number;
  delivery_radius_km?: number;
  delivery_base_fee?: number;
  delivery_fee_per_km?: number;
  free_delivery_over?: number;
  discount_percentage?: number;
}

export interface Product {
  id: number;
  business_id: number;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  in_stock: boolean;
  stock: number;
  image_url: string | null;
}

export interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  available: boolean;
  in_stock: boolean;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

// --- Pedidos del cliente (OrdersController) ---
export interface OrderListItem {
  id: number;
  status: OrderStatus;
  total: number;
  delivery_fee: number;
  discount?: number;
  total_with_delivery: number;
  business: string | { name: string };
  created_at: string;
  bis?: string | number;
}

export interface OrderItemDetail {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderDetail extends OrderListItem {
  items: OrderItemDetail[];
}

// --- Pedidos recibidos (BusinessOrdersController) ---
export interface BusinessOrderItem {
  name: string;
  quantity: number;
  unit_price?: number; // solo viene en la respuesta detallada (tras update_status)
}

export interface BusinessOrder {
  id: number;
  status: OrderStatus;
  total: number;
  customer: string;
  created_at: string;
  items?: BusinessOrderItem[];
}

export interface DashboardSummary {
  business: {
    id: number;
    name: string;
    status: BusinessStatus;
    active: boolean;
    category: string;
    address: string | null;
    phone: string | null;
  };
  orders: {
    pending: number;
    accepted: number;
    preparing: number;
    ready: number;
    delivered: number;
    cancelled: number;
    total: number;
  };
  products: { total: number; available: number; out_of_stock: number };
  sales: { total_revenue: number; orders_delivered: number };
}

export interface SalesReport {
  total_revenue: number;
  count: number;
  sales: Array<{
    id: number;
    customer: string;
    total: number;
    discount?: number;
    delivered_at: string;
    items: Array<{
      name: string;
      quantity: number;
      unit_price?: number;
    }>;
  }>;
}

export interface BusinessHour {
  day_of_week: number;
  day_name?: string;
  opens_at: string | null;
  closes_at: string | null;
  closed: boolean;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  customer: string;
  created_at: string;
}

export interface BusinessReviews {
  average_rating: number | null;
  count: number;
  reviews: Review[];
}

// --- Notificaciones ---
export interface Notification {
  id: number;
  title: string | null;
  body: string | null;
  type: string;
  read: boolean;
  notifiable_type: string;
  notifiable_id: number;
  created_at: string;
}

export interface NotificationsResponse {
  unread_count: number;
  notifications: Notification[];
}

// --- Admin ---
export interface AdminBusiness {
  id: number;
  name: string;
  status: BusinessStatus;
  active: boolean;
  category: string;
  address: string | null;
  owner: { id: number; name: string; email: string };
  created_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
}

export interface AdminUserDetail extends AdminUser {
  businesses: Array<{ id: number; name: string; status: BusinessStatus }>;
  orders_count: number;
}

export interface AdminOrderListItem {
  id: number;
  status: OrderStatus;
  total: number;
  customer: { id: number; name: string };
  business: { id: number; name: string };
  created_at: string;
}

export interface AdminOrderDetail extends AdminOrderListItem {
  items: Array<{ name: string; quantity: number; unit_price: number }>;
}

export interface AdminStats {
  users: {
    total: number;
    customers: number;
    business_owners: number;
    admins: number;
    inactive: number;
  };
  businesses: {
    total: number;
    pending: number;
    approved: number;
    suspended: number;
  };
  products: { total: number; out_of_stock: number };
  orders: {
    total: number;
    pending: number;
    in_progress: number;
    delivered: number;
    cancelled: number;
  };
  revenue: { total: number; last_30_days: number };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; pages: number; count: number; per_page: number };
}

export interface ApiErrorBody {
  error?: string;
  errors?: string[] | Record<string, string[]>;
  message?: string;
}
