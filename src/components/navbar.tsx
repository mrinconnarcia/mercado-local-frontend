"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth-context";
import { NotificationBell } from "@/src/components/notification-bell";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!isMounted || loading) {
    return (
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-emerald-700">
            Mercado Local
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-neutral-600 hover:text-neutral-900">
              Negocios
            </Link>
            <div className="h-8 w-24 animate-pulse rounded-md bg-neutral-200" />
            <div className="h-8 w-28 animate-pulse rounded-md bg-emerald-200" />
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-emerald-700">
          Mercado Local
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-neutral-600 hover:text-neutral-900">
            Negocios
          </Link>

          {user ? (
            <>
              {user.role === "customer" && (
                <Link
                  href="/cuenta/pedidos"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Mis pedidos
                </Link>
              )}
              {user.role === "business_owner" && (
                <Link
                  href="/negocio/dashboard"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Mi negocio
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Admin
                </Link>
              )}
              <NotificationBell />
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-700">{user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-neutral-100 px-3 py-1.5 text-neutral-700 hover:bg-neutral-200"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-neutral-600 hover:text-neutral-900"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
              >
                Registrarme
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}