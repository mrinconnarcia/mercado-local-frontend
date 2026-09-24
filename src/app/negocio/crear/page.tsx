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
      await businessesApi.create({
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
    <main className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-serif text-2xl text-neutral-900 sm:text-3xl">
          Creá tu negocio
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Un administrador tiene que aprobarlo antes de que aparezca
          públicamente.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}

          <TextField
            id="b_name"
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextareaField
            id="b_description"
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Dirección + ubicación en tiempo real */}
          <div className="flex flex-col gap-2">
            <TextField
              id="b_address"
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
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 sm:w-auto sm:self-start"
            >
              <PinIcon />
              {locating ? "Obteniendo ubicación…" : "Usar mi ubicación actual"}
            </button>
            {lat != null && lng != null && (
              <p className="flex items-center gap-1 text-xs text-emerald-700">
                <CheckIcon />
                Ubicación guardada ({lat.toFixed(5)}, {lng.toFixed(5)})
              </p>
            )}
          </div>

          {/* En pantallas grandes, teléfono y categoría van lado a lado */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              id="b_phone"
              label="Teléfono"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <SelectField
              id="b_category"
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

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Crear negocio
          </Button>
        </form>
      </div>
    </main>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
