"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { businessesApi, categoriesApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { BusinessCard } from "@/src/components/business-card";
import { ErrorBanner } from "@/src/components/ui/field";
import type { Business, Category } from "@/src/types";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category_id") ?? "";
  const q = searchParams.get("q") ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  // Garantizamos que el estado inicial sea siempre un array vacío
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(q);

  // Categorías se piden una sola vez.
  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  // Negocios se re-piden cada vez que cambia el filtro.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    
    businessesApi
      .list({ 
        category_id: categoryId ? Number(categoryId) : undefined, 
        q: q || undefined 
      })
      .then((response) => {
        // 1. Intentamos extraer el array de las propiedades más comunes de respuesta.
        // Si la API devuelve el array directamente, 'response' ya será el array.
        const dataArray = 
          response?.data ?? 
          response?.results ?? 
          response?.businesses ?? 
          response;

        // 2. Validación de seguridad: solo actualizamos el estado si es un array real.
        if (Array.isArray(dataArray)) {
          setBusinesses(dataArray);
        } else {
          console.warn("La respuesta de la API no es un array:", response);
          setBusinesses([]); // Fallback seguro
        }
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar los negocios.");
        setBusinesses([]); // Aseguramos array vacío en caso de error
      })
      .finally(() => setLoading(false));
      
  }, [categoryId, q]);

  const updateParams = (next: { category_id?: string; q?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/?${params.toString()}`);
  };

  // Protección adicional en el renderizado por si acaso
  const safeBusinesses = Array.isArray(businesses) ? businesses : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">Negocios cerca tuyo</h1>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ q: searchInput });
          }}
          className="flex-1"
        >
          <input
            type="search"
            placeholder="Buscar negocios..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </form>

        <select
          value={categoryId}
          onChange={(e) => updateParams({ category_id: e.target.value })}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {Array.isArray(categories) && categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {error && <ErrorBanner message={error} />}
        
        {loading ? (
          <p className="text-neutral-500">Cargando negocios...</p>
        ) : safeBusinesses.length === 0 ? (
          <p className="text-neutral-500">No encontramos negocios con ese filtro.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {safeBusinesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<p className="px-4 py-8 text-neutral-500">Cargando...</p>}>
      <HomeContent />
    </Suspense>
  );
}