"use client";

import { useEffect, useState, useCallback } from "react";
import { getZones } from "@/lib/api";
import { ZonesResponse } from "@/lib/types";
import { ZoneCard } from "@/components/zone-card";
import { ZoneCardSkeleton } from "@/components/zone-card-skeleton";
import { ApiStateBoundary } from "@/components/api-state-boundary";
import { MapPin, ChevronRight, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { computeOccupancy, computeViolationCount, zoneRequiresAttention } from "@/lib/compute";

export default function Home() {
  const [data, setData] = useState<ZonesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAllZonesSheetOpen, setIsAllZonesSheetOpen] = useState(false);

  const fetchZones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getZones("all");
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load zones"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const zonesWithComputed = data?.zones.map((zone) => {
    const occupancy = computeOccupancy(zone.vehicles);
    const violationCount = computeViolationCount(zone.vehicles, zone.timeLimit, zone.activities);
    const needsAttention = zoneRequiresAttention(zone.vehicles, zone.timeLimit, zone.maxCapacity, zone.activities);
    return { ...zone, occupancy, violationCount, needsAttention };
  }) || [];

  const zonesNeedingAttention = zonesWithComputed.filter((z) => z.needsAttention);
  const otherZones = zonesWithComputed.filter((z) => !z.needsAttention);

  const MAX_OTHER_ZONES_PREVIEW = 2;
  const hasMoreOtherZones = otherZones.length > MAX_OTHER_ZONES_PREVIEW;

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-5 space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Zones</h1>
        {isLoading ? (
          <Skeleton className="h-3 w-32" />
        ) : data && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {zonesNeedingAttention.length > 0 ? (
              <span className="text-[10px] uppercase font-medium">
                Updated{" "}
                {formatDistanceToNow(new Date(data.lastUpdated), {
                  addSuffix: true,
                })}
              </span>
            ) : (
              <>
                <span className="text-[10px] uppercase font-semibold text-primary">
                  All zones clear
                </span>
                <span className="opacity-30">•</span>
                <span className="text-[10px] uppercase font-medium">
                  Updated{" "}
                  {formatDistanceToNow(new Date(data.lastUpdated), {
                    addSuffix: true,
                  })}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <ApiStateBoundary
        isLoading={isLoading}
        error={error}
        onRetry={fetchZones}
        empty={!isLoading && data?.zones.length === 0}
        emptyMessage={
          <div className="border bg-card">
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="bg-muted p-2.5 mb-3">
                <MapPin
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                All zones clear
              </p>
              <p className="text-muted-foreground/70 mt-1 max-w-[180px] text-[10px] leading-tight">
                No zones need immediate attention.
              </p>
            </div>
          </div>
        }
      >
        {isLoading ? (
          <div className="flex flex-col gap-5">
            <section>
              <div className="mb-2 flex items-center gap-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="border bg-card p-1 space-y-1">
                <ZoneCardSkeleton />
                <ZoneCardSkeleton />
              </div>
            </section>
            <section>
              <div className="mb-2 flex items-center gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="border bg-card p-1 space-y-1">
                <ZoneCardSkeleton />
              </div>
            </section>
          </div>
        ) : data && data.zones.length > 0 ? (
          <div className="flex flex-col gap-5">
            {/* Zones Requiring Attention */}
            <section>
              <div className="mb-2 flex items-center justify-start gap-2">
                <h2 className="text-[10px] font-bold uppercase text-destructive">
                  Requires Attention
                </h2>
                {zonesNeedingAttention.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-[9px] h-4 px-1 py-0 font-semibold"
                  >
                    {zonesNeedingAttention.length}
                  </Badge>
                )}
              </div>
              {zonesNeedingAttention.length > 0 ? (
                <div className="border border-destructive/30 bg-destructive/5 overflow-hidden">
                  <div className="divide-y divide-destructive/20">
                    {zonesNeedingAttention.map((zone) => (
                      <div key={zone.id}>
                        <ZoneCard
                          zone={zone}
                          occupancy={zone.occupancy}
                          violationCount={zone.violationCount}
                          priority
                          noBorder
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3 px-3 py-3">
                    <div className="bg-primary/10 p-2">
                      <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        All clear
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        No zones require immediate attention
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Other Zones - Preview with View All */}
            {otherZones.length > 0 && (
              <section>
                <div className="mb-2 flex items-center justify-start gap-2">
                  <h2 className="text-[10px] font-bold uppercase text-muted-foreground">
                    Other Zones
                  </h2>
                  <Badge
                    variant="secondary"
                    className="text-[9px] h-4 px-1 py-0 font-semibold"
                  >
                    {otherZones.length}
                  </Badge>
                </div>
                <div className="border bg-card overflow-hidden">
                  <div className="divide-y divide-muted/30">
                    {otherZones
                      .slice(0, MAX_OTHER_ZONES_PREVIEW)
                      .map((zone) => (
                        <div key={zone.id}>
                          <ZoneCard
                            zone={zone}
                            occupancy={zone.occupancy}
                            violationCount={zone.violationCount}
                            compact
                            noBorder
                          />
                        </div>
                      ))}
                  </div>
                  {hasMoreOtherZones && (
                    <button
                      onClick={() => setIsAllZonesSheetOpen(true)}
                      className="w-full border-t bg-card px-3 py-2 flex items-center justify-between text-[10px] font-bold uppercase text-primary hover:bg-muted/50 transition-colors"
                    >
                      <span>View all {otherZones.length} zones</span>
                      <ChevronRight className="size-3" />
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>
        ) : null}
      </ApiStateBoundary>

      {/* All Zones Sheet */}
      <Sheet open={isAllZonesSheetOpen} onOpenChange={setIsAllZonesSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] px-4">
          <SheetHeader>
            <SheetTitle>All Zones</SheetTitle>
            <SheetDescription>
              {otherZones.length} zones with no current issues
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-3">
            {otherZones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                occupancy={zone.occupancy}
                violationCount={zone.violationCount}
                compact
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
