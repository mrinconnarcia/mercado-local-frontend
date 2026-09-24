"use client";

import { useEffect, useState, type FormEvent } from "react";
import { productsApi } from "@/src/lib/endpoints";
import { useBusinessPanel } from "@/src/lib/business-context";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import {
  ErrorBanner,
  TextareaField,
  TextField,
} from "@/src/components/ui/field";
import type { Product } from "@/src/types";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  available: boolean;
  image: File | null;
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  stock: "",
  available: true,
  image: null,
};

function buildFormData(form: ProductFormState): FormData {
  const fd = new FormData();
  fd.append("product[name]", form.name);
  fd.append("product[description]", form.description);
  fd.append("product[price]", form.price);
  fd.append("product[stock]", form.stock);
  fd.append("product[available]", String(form.available));
  if (form.image) fd.append("product[image]", form.image);
  return fd;
}

export default function ProductsPage() {
  const { business } = useBusinessPanel();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!business) return;
    setLoading(true);
    productsApi
      .listByBusiness(business.id)
      .then((res) => setProducts(res.data))
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los productos.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [business]);

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId("new");
  };

  const startEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      stock: String(p.stock),
      available: p.available,
      image: null,
    });
    setEditingId(p.id);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSaving(true);
    setError(null);
    try {
      const fd = buildFormData(form);
      if (editingId === "new") await productsApi.create(business.id, fd);
      else if (editingId != null) await productsApi.update(editingId, fd);
      setEditingId(null);
      load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo guardar el producto.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await productsApi.remove(id);
      load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar el producto.",
      );
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-neutral-900">Productos</h1>
        {editingId === null && (
          <Button onClick={startCreate}>+ Nuevo producto</Button>
        )}
      </div>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {editingId !== null && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5"
        >
          <h2 className="font-serif text-lg text-neutral-900">
            {editingId === "new" ? "Nuevo producto" : "Editar producto"}
          </h2>
          <TextField
            id="p_name"
            label="Nombre"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextareaField
            id="p_description"
            label="Descripción"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-3">
            <TextField
              id="p_price"
              label="Precio"
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <TextField
              id="p_stock"
              label="Stock"
              type="number"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <label className="flex w-fit items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) =>
                setForm({ ...form, available: e.target.checked })
              }
              className="h-4 w-4 rounded border-neutral-300 text-emerald-700 focus:ring-emerald-600/30"
            />
            Disponible
          </label>
          <div>
            <label className="text-sm font-medium text-neutral-700">
              Imagen
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, image: e.target.files?.[0] ?? null })
              }
              className="mt-1.5 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              Guardar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditingId(null)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-neutral-100"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-4 text-neutral-500">
          Todavía no cargaste ningún producto.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-neutral-200 bg-white p-4"
            >
              {p.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="mb-3 h-28 w-full rounded-lg object-cover"
                />
              )}
              <h3 className="font-medium text-neutral-900">{p.name}</h3>
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-700">
                  ${p.price.toFixed(2)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.available
                      ? "bg-neutral-100 text-neutral-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {p.available ? `Stock: ${p.stock}` : "No disponible"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => startEdit(p)}
                >
                  Editar
                </Button>
                <Button variant="danger" onClick={() => handleDelete(p.id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
