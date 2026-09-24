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
      <h1 className="font-serif text-2xl text-neutral-900">Inventario</h1>
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
        <div className="mt-4 animate-pulse space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 rounded-lg bg-neutral-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-4 text-neutral-500">
          Todavía no tenés productos cargados.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Producto</th>
                <th className="px-4 py-2.5">Stock</th>
                <th className="px-4 py-2.5">Disponible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/60">
                  <td className="px-4 py-2.5">{item.name}</td>
                  <td className="px-4 py-2.5">
                    <input
                      type="number"
                      defaultValue={item.stock}
                      disabled={savingId === item.id}
                      onBlur={(e) => {
                        const value = Number(e.target.value);
                        if (value !== item.stock) updateStock(item, value);
                      }}
                      className="w-20 rounded-lg border border-neutral-300 px-2 py-1 text-sm transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => toggleAvailable(item)}
                      disabled={savingId === item.id}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                        item.available
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      }`}
                    >
                      {item.available ? "Sí" : "No"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
