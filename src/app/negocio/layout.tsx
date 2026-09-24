"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequireRole } from "@/src/lib/use-require-role";
import {
  Clock,
  LayoutGrid,
  Layers,
  Settings,
  ShoppingBag,
  Tag,
  TrendingUp,
} from "lucide-react";

const LINKS = [
  { href: "/negocio/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/negocio/productos", label: "Productos", icon: Tag },
  { href: "/negocio/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/negocio/inventario", label: "Inventario", icon: Layers },
  { href: "/negocio/horarios", label: "Horarios", icon: Clock },
  { href: "/negocio/ventas", label: "Ventas", icon: TrendingUp },
  { href: "/negocio/configuracion", label: "Configuración", icon: Settings },
];

export default function NegocioLayout({ children }: { children: ReactNode }) {
  const { ready } = useRequireRole(["business_owner"]);
  const pathname = usePathname();

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 rounded bg-neutral-200" />
          <div className="h-32 rounded-xl bg-neutral-100" />
        </div>
      </div>
    );
  }

  // La página de creación del negocio no lleva la barra lateral (todavía no hay negocio).
  if (pathname === "/negocio/crear") return <>{children}</>;

  return (
    <div className="mx-auto max-w-6xl gap-6 px-4 py-6 lg:flex lg:py-8">
      {/* Nav mobile: pills horizontales con scroll */}
      <nav className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-emerald-700 font-medium text-white"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Nav desktop: sidebar */}
      <aside className="hidden w-52 shrink-0 lg:block">
        <nav className="sticky top-20 flex flex-col gap-1">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-emerald-50 font-medium text-emerald-800"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
