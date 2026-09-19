"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth-context";
import type { UserRole } from "@/src/types";

/**
 * Redirige a /login si no hay sesión, o a "/" si el rol no está permitido.
 * "ready" es true recién cuando ya se puede renderizar el contenido protegido.
 */
export function useRequireRole(allowed: UserRole[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allowed.includes(user.role)) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const ready = !loading && !!user && allowed.includes(user.role);
  return { user, ready };
}
