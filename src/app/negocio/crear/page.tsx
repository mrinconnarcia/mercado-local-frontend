"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { businessesApi, categoriesApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import {
  ErrorBanner,
  SelectField,
  TextareaField,
  TextField,
} from "@/src/components/ui/field";
import type { Category } from "@/src/types";

export default function CreateBusinessPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    categoriesApi
      .list()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Pide la ubicación del navegador y la convierte en dirección legible
  const useMyLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "es" } },
          );
          const data = await res.json();
          if (data?.display_name) setAddress(data.display_name);
        } catch {
          // si falla el reverse geocode igual guardamos lat/lng
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError(
          "No pudimos obtener tu ubicación. Revisá los permisos del navegador.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const business = await businessesApi.create({
        name,
        description,
        address,
        phone,
        category_id: Number(categoryId),
      });
      router.push("/negocio/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo crear el negocio.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Creá tu negocio
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Un administrador tiene que aprobarlo antes de que aparezca
          públicamente.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && <ErrorBanner message={""}>{error}</ErrorBanner>}

          <TextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextareaField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Dirección + ubicación en tiempo real */}
          <div className="flex flex-col gap-2">
            <TextField
              label="Dirección"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle y número, ciudad…"
              required
            />
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 sm:w-auto sm:self-start"
            >
              <span aria-hidden>📍</span>
              {locating ? "Obteniendo ubicación…" : "Usar mi ubicación actual"}
            </button>
            {lat != null && lng != null && (
              <p className="text-xs text-emerald-600">
                ✓ Ubicación guardada ({lat.toFixed(5)}, {lng.toFixed(5)})
              </p>
            )}
          </div>

          {/* En pantallas grandes, teléfono y categoría van lado a lado */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Teléfono"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <SelectField
              label="Categoría"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Elegí una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
          </div>

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Creando…" : "Crear negocio"}
          </Button>
        </form>
      </div>
    </main>
  );
}
