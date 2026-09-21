import Link from "next/link";
import type { Business } from "@/src/types";

export function BusinessCard({ business }: { business: Business }) {
  return (
    <Link
      href={`/negocios/${business.id}`}
      className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-neutral-900">{business.name}</h3>
        {business.average_rating != null && (
          <span className="text-sm text-amber-600">
            ★ {Number(business.average_rating).toFixed(1)}
          </span>
        )}
      </div>
      {business.category && (
        <span className="text-xs text-neutral-500">{business.category}</span>
      )}
      {business.description && (
        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
          {business.description}
        </p>
      )}
      {business.address && (
        <p className="mt-1 text-xs text-neutral-400">{business.address}</p>
      )}
    </Link>
  );
}
