"use client";

import { useEffect, useState } from "react";
import { businessPanelApi } from "@/src/lib/endpoints";
import { useBusinessPanel } from "@/src/lib/business-context";
import { ApiError } from "@/src/lib/api";
import { Button } from "@/src/components/ui/button";
import { ErrorBanner } from "@/src/components/ui/field";
import type { BusinessHour } from "@/src/types";

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function defaultHours(): BusinessHour[] {
  return DAY_NAMES.map((_, day_of_week) => ({
    day_of_week,
    opens_at: "09:00",
    closes_at: "18:00",
    closed: day_of_week === 0,
  }));
}

export default function BusinessHoursPage() {
  const { business } = useBusinessPanel();
  const [hours, setHours] = useState<BusinessHour[]>(defaultHours());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!business) return;
    businessPanelApi
      .getHours(business.id)
      .then((existing) => {
        if (existing.length === 0) return;
        const merged = defaultHours().map(
          (fallback) =>
            existing.find((h) => h.day_of_week === fallback.day_of_week) ??
            fallback,
        );
        setHours(merged);
      })
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los horarios.",
        ),
      )
      .finally(() => setLoading(false));
  }, [business]);

  const updateDay = (day: number, patch: Partial<BusinessHour>) => {
    setHours((prev) =>
      prev.map((h) => (h.day_of_week === day ? { ...h, ...patch } : h)),
    );
  };

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    setError(null);
    try {
      setHours(await businessPanelApi.setHours(business.id, hours));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudieron guardar los horarios.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-7 w-48 rounded bg-neutral-200" />
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-neutral-100" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-neutral-900">
        Horarios de atención
      </h1>
      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {hours.map((h) => (
          <div
            key={h.day_of_week}
            className="flex flex-col gap-2.5 rounded-xl border border-neutral-200 bg-white p-3.5 sm:flex-row sm:items-center sm:gap-4"
          >
            <span className="w-24 shrink-0 text-sm font-medium text-neutral-700">
              {DAY_NAMES[h.day_of_week]}
            </span>
            <label className="flex items-center gap-1.5 text-xs text-neutral-500">
              <input
                type="checkbox"
                checked={h.closed}
                onChange={(e) =>
                  updateDay(h.day_of_week, { closed: e.target.checked })
                }
                className="h-4 w-4 rounded border-neutral-300 text-emerald-700 focus:ring-emerald-600/30"
              />
              Cerrado
            </label>
            {!h.closed && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={h.opens_at ?? ""}
                  onChange={(e) =>
                    updateDay(h.day_of_week, { opens_at: e.target.value })
                  }
                  className="rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
                <span className="text-neutral-400">a</span>
                <input
                  type="time"
                  value={h.closes_at ?? ""}
                  onChange={(e) =>
                    updateDay(h.day_of_week, { closes_at: e.target.value })
                  }
                  className="rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <Button className="mt-4" loading={saving} onClick={handleSave}>
        Guardar horarios
      </Button>
    </div>
  );
}
