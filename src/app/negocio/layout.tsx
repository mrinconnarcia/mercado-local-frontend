"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequireRole } from "@/src/lib/use-require-role";

const LINKS = [
  { href: "/negocio/dashboard", label: "Dashboard" },
  { href: "/negocio/productos", label: "Productos" },
  { href: "/negocio/pedidos", label: "Pedidos" },
  { href: "/negocio/inventario", label: "Inventario" },
  { href: "/negocio/horarios", label: "Horarios" },
  { href: "/negocio/ventas", label: "Ventas" },
  { href: "/negocio/configuracion", label: "Configuración" },
];

export default function NegocioLayout({ children }: { children: ReactNode }) {
  const { ready } = useRequireRole(["business_owner"]);
  const pathname = usePathname();

  if (!ready) return <p className="px-4 py-8 text-neutral-500">Cargando...</p>;

  // La página de creación del negocio no lleva la barra lateral (todavía no hay negocio).
  if (pathname === "/negocio/crear") return <>{children}</>;

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
      <aside className="w-48 shrink-0">
        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm ${
                pathname === link.href
                  ? "bg-emerald-100 font-medium text-emerald-800"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
