/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { businessesApi, productsApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { ErrorBanner } from "@/src/components/ui/field";
import type { Business, Product } from "@/src/types";

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([businessesApi.get(id), productsApi.listByBusiness(id)])
      .then(([b, p]) => {
        setBusiness(b);
        // Extraer el array de productos - ajustar según la estructura real
        const productsArray = Array.isArray(p) ? p : p.data || p.products || [];
        setProducts(productsArray);
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

  if (loading) return <p className="px-4 py-8 text-neutral-500">Cargando...</p>;
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorBanner message={error} />
      </div>
    );
  if (!business) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900">{business.name}</h1>
        {business.category?.name && (
          <p className="text-sm text-neutral-500">{business.category.name}</p>
        )}
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

      <h2 className="mt-6 text-lg font-semibold text-neutral-900">Productos</h2>
      {products.length === 0 ? (
        <p className="mt-2 text-neutral-500">
          Este negocio todavía no cargó productos.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  ${Number(product.price).toFixed(2)}
                </span>
                <span
                  className={`text-xs ${product.available ? "text-neutral-500" : "text-red-500"}`}
                >
                  {product.available
                    ? `Stock: ${product.stock}`
                    : "No disponible"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
