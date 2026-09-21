"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { businessesApi } from "@/src/lib/endpoints";
import { useRequireRole } from "@/src/lib/use-require-role";
import type { Business } from "@/src/types";

interface BusinessPanelContextValue {
  business: Business | null;
  loading: boolean;
  refresh: () => void;
}

const BusinessPanelContext = createContext<
  BusinessPanelContextValue | undefined
>(undefined);

export function BusinessPanelProvider({ children }: { children: ReactNode }) {
  const { ready } = useRequireRole(["business_owner"]);
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    businessesApi
      .mine()
      .then((businesses) => {
        // Tu backend soporta que un dueño tenga varios negocios (has_many),
        // pero el panel de este front está armado para uno solo por ahora.
        // Tomamos el primero; si el día de mañana agregás un selector de
        // negocios, este es el lugar donde engancharlo.
        if (businesses.length === 0) {
          router.replace("/negocio/crear");
          return;
        }
        setBusiness(businesses[0]);
      })
      .catch(() => router.replace("/negocio/crear"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (ready) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <BusinessPanelContext.Provider value={{ business, loading, refresh: load }}>
      {children}
    </BusinessPanelContext.Provider>
  );
}

export function useBusinessPanel(): BusinessPanelContextValue {
  const ctx = useContext(BusinessPanelContext);
  if (!ctx)
    throw new Error(
      "useBusinessPanel debe usarse dentro de <BusinessPanelProvider>",
    );
  return ctx;
}
