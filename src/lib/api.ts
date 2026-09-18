import type { ApiErrorBody } from "@/src/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
const TOKEN_KEY = "ml_token";

/** Error tipado que lanzamos ante cualquier respuesta no-2xx de la API. */
export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    const message =
      body.error ??
      body.message ??
      (Array.isArray(body.errors) ? body.errors.join(", ") : undefined) ??
      `Error ${status}`;
    super(message);
    this.status = status;
    this.body = body;
  }
}

// --- Manejo del token JWT (guardado en localStorage del navegador) ---

export function getToken(): string | null {
  if (typeof window === "undefined") return null; // no hay localStorage en el servidor
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Para subir archivos (ej. imagen de producto) mandamos FormData en vez de JSON. */
  formData?: FormData;
  params?: Record<string, string | number | boolean | undefined>;
  /** Por defecto se manda el token si existe. Poné false para llamadas públicas explícitas. */
  auth?: boolean;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

/**
 * Función central de fetch. Todas las llamadas a la API pasan por acá.
 * Devuelve el JSON ya tipado como T, o lanza ApiError si la respuesta no fue 2xx.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, formData, params, auth = true } = options;

  const headers: HeadersInit = {};
  if (!formData) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiError(res.status, data as ApiErrorBody);
  }

  return data as T;
}