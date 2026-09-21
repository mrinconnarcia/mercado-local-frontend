"use client";

import { useEffect, useState } from "react";
import { businessPanelApi } from "@/src/lib/endpoints";
import { useBusinessPanel } from "@/src/lib/business-context";
import { ApiError } from "@/src/lib/api";
import { ErrorBanner } from "@/src/components/ui/field";
import type { InventoryItem } from "@/src/types";

export default function InventoryPage() {
  const { business } = useBusinessPanel();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = () => {
    if (!business) return;
    setLoading(true);
    businessPanelApi
      .inventory(business.id)
      .then(setItems)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudo cargar el inventario.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [business]);

  const updateStock = async (item: InventoryItem, stock: number) => {
    if (!business) return;
    setSavingId(item.id);
    try {
      const updated = await businessPanelApi.updateInventory(
        business.id,
        item.id,
        { stock },
      );
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar el stock.",
      );
    } finally {
      setSavingId(null);
    }
  };

  const toggleAvailable = async (item: InventoryItem) => {
    if (!business) return;
    setSavingId(item.id);
    try {
      const updated = await businessPanelApi.updateInventory(
        business.id,
        item.id,
        { available: !item.available },
      );
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar la disponibilidad.",
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Inventario</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Acá ves todos tus productos, incluso los que no aparecen para los
        clientes.
      </p>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <p className="mt-4 text-neutral-500">Cargando...</p>
      ) : (
        <table className="mt-4 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Producto</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Disponible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-700 ">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    defaultValue={item.stock}
                    disabled={savingId === item.id}
                    onBlur={(e) => {
                      const value = Number(e.target.value);
                      if (value !== item.stock) updateStock(item, value);
                    }}
                    className="w-20 rounded-md border border-neutral-300 px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleAvailable(item)}
                    disabled={savingId === item.id}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.available
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {item.available ? "Sí" : "No"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
