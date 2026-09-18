// Tipos calcados de los endpoints de la API de Mercado Local (Rails).
// Si el backend devuelve algún campo distinto, este es el único lugar que hay que tocar.

export type UserRole = "customer" | "business_owner" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  active?: boolean;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
}

export type BusinessStatus = "pending" | "approved" | "suspended";

export interface Business {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  category_id: number;
  category?: Category;
  owner_id?: number;
  active: boolean;
  status?: BusinessStatus;
  latitude?: string | number | null;
  longitude?: string | number | null;
  delivery_radius_km?: number | null;
  delivery_base_fee?: number | null;
  delivery_fee_per_km?: number | null;
  free_delivery_over?: number | null;
  average_rating?: number | null;
  reviews_count?: number;
  created_at?: string;
}

export interface Product {
  id: number;
  business_id: number;
  name: string;
  description: string | null;
  price: number | string;
  stock: number;
  available: boolean;
  image_url?: string | null;
  created_at?: string;
}

export type OrderStatus =
  | "pending" // carrito
  | "confirmed"
  | "accepted"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number | string;
  subtotal?: number | string;
}

export interface Order {
  id: number;
  business_id: number;
  business?: Business;
  user_id?: number;
  status: OrderStatus;
  delivery_address: string | null;
  delivery_latitude?: string | number | null;
  delivery_longitude?: string | number | null;
  delivery_fee?: number | string | null;
  total?: number | string | null;
  order_items?: OrderItem[];
  created_at?: string;
}

export interface Notification {
  id: number;
  title?: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface BusinessHour {
  day_of_week: number; // 0 = domingo ... 6 = sábado
  opens_at?: string | null;
  closes_at?: string | null;
  closed: boolean;
}

export interface Review {
  id: number;
  order_id?: number;
  user?: Pick<User, "id" | "name">;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface DashboardSummary {
  total_orders?: number;
  pending_orders?: number;
  total_sales?: number;
  [key: string]: unknown;
}

export interface AdminStats {
  total_businesses?: number;
  total_users?: number;
  total_orders?: number;
  [key: string]: unknown;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiErrorBody {
  error?: string;
  errors?: string[] | Record<string, string[]>;
  message?: string;
}