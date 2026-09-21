"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/src/lib/endpoints";
import { ApiError } from "@/src/lib/api";
import { ErrorBanner } from "@/src/components/ui/field";
import type { AdminUser, UserRole } from "@/src/types";

const ROLES: Array<{ label: string; value: UserRole | "" }> = [
  { label: "Todos", value: "" },
  { label: "Clientes", value: "customer" },
  { label: "Dueños", value: "business_owner" },
  { label: "Admins", value: "admin" },
];

export default function AdminUsersPage() {
  const [role, setRole] = useState<UserRole | "">("");
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi
      .listUsers({ role: role || undefined, q: q || undefined })
      .then(setUsers)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los usuarios.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [role]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Usuarios</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${role === r.value ? "bg-emerald-600 text-white" : "bg-neutral-100 text-neutral-600"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex-1"
        >
          <input
            type="search"
            placeholder="Buscar por nombre o email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full max-w-xs rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </form>
      </div>

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
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50">
                <td className="px-4 py-2">
                  <Link
                    href={`/admin/usuarios/${u.id}`}
                    className="text-emerald-700 hover:underline"
                  >
                    {u.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-neutral-600">{u.email}</td>
                <td className="px-4 py-2 text-neutral-600">{u.role}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}
                  >
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
