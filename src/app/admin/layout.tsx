"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequireRole } from "@/src/lib/use-require-role";

const LINKS = [
  { href: "/admin", label: "Estadísticas" },
  { href: "/admin/negocios", label: "Negocios" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/pedidos", label: "Pedidos" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { ready } = useRequireRole(["admin"]);
  const pathname = usePathname();

  if (!ready) return <p className="px-4 py-8 text-neutral-500">Cargando...</p>;

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
