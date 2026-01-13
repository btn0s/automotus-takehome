import { ZoneCardSkeleton } from "@/components/zone-card-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-9 w-9 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <ZoneCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
