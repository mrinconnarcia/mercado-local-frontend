import Link from "next/link";
import type { Business } from "@/src/types";

export function BusinessCard({ business }: { business: Business }) {
  return (
    <Link
      href={`/negocios/${business.id}`}
      className="group flex h-full flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md hover:shadow-neutral-900/5"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-base text-neutral-900 group-hover:text-emerald-800">
          {business.name}
        </h3>
        {business.average_rating != null && (
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-amber-600">
            <StarIcon />
            {Number(business.average_rating).toFixed(1)}
          </span>
        )}
      </div>

      {business.category && (
        <span className="w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
          {business.category}
        </span>
      )}

      {business.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600">
          {business.description}
        </p>
      )}

      {business.address && (
        <p className="mt-auto flex items-center gap-1 pt-1 text-xs text-neutral-400">
          <PinIcon />
          {business.address}
        </p>
      )}
    </Link>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17.3 5.7 20.8l1.7-6.9L2 9.2l7.1-.6L12 2Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5 shrink-0"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
