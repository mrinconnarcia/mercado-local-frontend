"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth-context";
import { NotificationBell } from "@/src/components/notification-bell";

const NAV_LINK_CLASSES =
  "text-sm text-neutral-600 transition-colors hover:text-emerald-800";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/");
  };

  const dashboardLink =
    user?.role === "customer"
      ? { href: "/cuenta/pedidos", label: "Mis pedidos" }
      : user?.role === "business_owner"
        ? { href: "/negocio/dashboard", label: "Mi negocio" }
        : user?.role === "admin"
          ? { href: "/admin", label: "Admin" }
          : null;

  if (!isMounted || loading) {
    return (
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="font-serif text-lg text-emerald-900">
            Mercado Local
          </span>
          <div className="flex items-center gap-3">
            <div className="hidden h-4 w-16 animate-pulse rounded bg-neutral-200 sm:block" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-neutral-200" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-serif text-lg text-emerald-900 transition-colors hover:text-emerald-700"
        >
          Mercado Local
        </Link>

        {/* Nav de escritorio */}
        <nav className="hidden items-center gap-5 md:flex">
          <Link href="/" className={NAV_LINK_CLASSES}>
            Negocios
          </Link>

          {user ? (
            <>
              {dashboardLink && (
                <Link href={dashboardLink.href} className={NAV_LINK_CLASSES}>
                  {dashboardLink.label}
                </Link>
              )}
              <NotificationBell />
              <div className="ml-1 flex items-center gap-3 border-l border-neutral-200 pl-4">
                <span className="text-sm text-neutral-700">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
                >
                  Salir
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={NAV_LINK_CLASSES}>
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
              >
                Registrarme
              </Link>
            </>
          )}
        </nav>

        {/* Controles mobile */}
        <div className="flex items-center gap-1.5 md:hidden">
          {user && <NotificationBell />}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Panel mobile */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="border-t border-neutral-200 bg-white px-4 py-3 md:hidden"
        >
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              Negocios
            </Link>

            {user ? (
              <>
                {dashboardLink && (
                  <Link
                    href={dashboardLink.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-2 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    {dashboardLink.label}
                  </Link>
                )}
                <div className="mt-1 flex items-center justify-between border-t border-neutral-100 px-2 pt-3">
                  <span className="text-sm text-neutral-700">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
                  >
                    Salir
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-1 flex flex-col gap-2 border-t border-neutral-100 pt-3">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-emerald-700 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-800"
                >
                  Registrarme
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
