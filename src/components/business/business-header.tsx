import { PhoneIcon, PinIcon, StarIcon } from "@/src/components/business/icons";
import type { Business } from "@/src/types";

export function BusinessHeader({ business }: { business: Business }) {
  return (
    <div className="border-b border-neutral-200 pb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-neutral-900 sm:text-3xl">
            {business.name}
          </h1>
          {business.category && (
            <span className="mt-1.5 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
              {business.category}
            </span>
          )}
        </div>
        {business.average_rating != null && (
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-amber-600">
            <StarIcon />
            {Number(business.average_rating).toFixed(1)}
          </span>
        )}
      </div>

      {business.description && (
        <p className="mt-3 leading-relaxed text-neutral-700">
          {business.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-neutral-500">
        {business.address && (
          <span className="flex items-center gap-1.5">
            <PinIcon />
            {business.address}
          </span>
        )}
        {business.phone && (
          <span className="flex items-center gap-1.5">
            <PhoneIcon />
            {business.phone}
          </span>
        )}
      </div>
    </div>
  );
}