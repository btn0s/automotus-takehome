import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border bg-card p-4">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-20" />
        </div>
        <div className="rounded-lg border bg-card p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}
