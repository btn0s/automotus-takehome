"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getZoneDetail } from "@/lib/api";
import { ZoneDetailResponse } from "@/lib/types";
import { ApiStateBoundary } from "@/components/api-state-boundary";
import { VehicleRow } from "@/components/vehicle-row";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Car, ChevronRight, Clock, CheckCircle2, ClipboardList } from "lucide-react";
import { getActivityTypeConfig } from "@/lib/activity-types";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { LogActionSheet } from "@/components/log-action-sheet";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { computeOccupancy, vehicleRequiresAttention, vehicleHasCitation } from "@/lib/compute";

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  // useParams() returns the params object directly in client components
  const zoneId = params.id as string;

  const [data, setData] = useState<ZoneDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const [initialVehicleId, setInitialVehicleId] = useState<
    string | undefined
  >();
  const [initialActionType, setInitialActionType] = useState<
    string | undefined
  >();
  const [isOtherVehiclesSheetOpen, setIsOtherVehiclesSheetOpen] =
    useState(false);
  const [isActivitySheetOpen, setIsActivitySheetOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const openLogSheet = (vehicleId?: string, actionType?: string) => {
    setInitialVehicleId(vehicleId);
    setInitialActionType(actionType);
    setIsLogSheetOpen(true);
  };

  const handleLogSheetChange = (open: boolean) => {
    setIsLogSheetOpen(open);
    if (!open) {
      // Small delay to prevent UI flicker while sheet is animating closed
      setTimeout(() => {
        setInitialVehicleId(undefined);
        setInitialActionType(undefined);
      }, 300);
    }
  };

  const fetchZoneDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getZoneDetail(zoneId);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load zone details")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (zoneId) {
      fetchZoneDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId]);

  const handleActivityLogged = () => {
    // Refresh zone detail to show new activity
    fetchZoneDetail();
    setIsLogSheetOpen(false);
  };

  const zone = data?.zone;
  const vehicles = zone?.vehicles || [];
  const activities = zone?.activities || [];

  const occupancy = computeOccupancy(vehicles);

  const getVehicleMinutesOver = (vehicle: typeof vehicles[number]) => {
    if (!zone) return -Infinity;
    const arrivalTime = new Date(vehicle.arrivalTime).getTime();
    const minutesAgo = Math.floor((now - arrivalTime) / (60 * 1000));
    return minutesAgo - zone.timeLimit;
  };

  const vehiclesRequiringAttention = zone
    ? vehicles
        .filter((v) => vehicleRequiresAttention(v, zone.timeLimit, activities, now))
        .sort((a, b) => {
          const aHasCitation = vehicleHasCitation(a, activities);
          const bHasCitation = vehicleHasCitation(b, activities);
          if (aHasCitation && !bHasCitation) return -1;
          if (!aHasCitation && bHasCitation) return 1;
          return getVehicleMinutesOver(b) - getVehicleMinutesOver(a);
        })
    : [];

  const otherVehicles = zone
    ? vehicles.filter((v) => !vehicleRequiresAttention(v, zone.timeLimit, activities, now))
    : [];

  const MAX_OTHER_VEHICLES_PREVIEW = 2;
  const MAX_ACTIVITY_PREVIEW = 3;

  const hasMoreOtherVehicles = otherVehicles.length > MAX_OTHER_VEHICLES_PREVIEW;
  const hasMoreActivity = activities.length > MAX_ACTIVITY_PREVIEW;

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-2 h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Zones
        </Button>
      </div>

      <ApiStateBoundary
        isLoading={isLoading}
        error={error}
        onRetry={fetchZoneDetail}
      >
        {isLoading ? (
          <div className="flex flex-col gap-5">
            <section>
              <Skeleton className="h-6 w-48 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </section>
            <section>
              <div className="mb-2 flex items-center gap-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <div className="border bg-card p-3 space-y-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            </section>
            <section>
              <div className="mb-2 flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <div className="border bg-card p-3 space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </section>
            <section>
              <div className="border bg-card overflow-hidden">
                <div className="px-3 py-2 border-b">
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </section>
          </div>
        ) : zone ? (
          <div className="flex flex-col gap-5">
            {/* Zone Header */}
            <section>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-xl font-bold tracking-tight">
                    {zone.name}
                  </h1>
                  <div className="mt-1.5 flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3 shrink-0" aria-hidden="true" />
                      <span>{zone.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-primary">
                          {zone.maxCapacity - occupancy}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-bold text-primary">
                          {zone.maxCapacity}
                        </span>
                        <span className="text-muted-foreground text-[11px] uppercase font-bold tracking-tight">
                          spots free
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-3" />
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-3 shrink-0" aria-hidden="true" />
                        <span className="text-[11px] uppercase font-bold tracking-tight">
                          {zone.timeLimit} min limit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Vehicles Requiring Attention */}
            <section>
              <div className="mb-2 flex items-center justify-start gap-2">
                <h2 className="text-[11px] font-bold uppercase text-destructive">
                  Requires Attention
                </h2>
                {vehiclesRequiringAttention.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-[11px] h-5 px-1.5 py-0 font-semibold"
                  >
                    {vehiclesRequiringAttention.length}
                  </Badge>
                )}
              </div>
              {vehiclesRequiringAttention.length > 0 ? (
                <div className="border border-destructive/30 bg-destructive/5 overflow-hidden">
                  <div className="divide-y divide-destructive/20">
                    {vehiclesRequiringAttention.map((vehicle) => {
                      const hasCitation = vehicleHasCitation(vehicle, activities);
                      return (
                        <div key={vehicle.id} className="px-3 bg-card">
                          <VehicleRow
                            vehicle={vehicle}
                            zoneTimeLimit={zone.timeLimit}
                            hasViolation={hasCitation}
                            onAction={(vehicleId, actionType) =>
                              openLogSheet(vehicleId, actionType)
                            }
                            showQuickActions
                            now={now}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3 px-3 py-3">
                    <div className="bg-primary/10 p-2">
                      <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        All clear
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        No vehicles require attention
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Other Vehicles - Preview with View All */}
            <section>
              <div className="mb-2 flex items-center justify-start gap-2">
                <h2 className="text-[11px] font-bold uppercase text-muted-foreground">
                  Other Vehicles
                </h2>
                {otherVehicles.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] h-5 px-1.5 py-0 font-semibold"
                  >
                    {otherVehicles.length}
                  </Badge>
                )}
              </div>
              {otherVehicles.length > 0 ? (
                <div className="border bg-card overflow-hidden">
                  <div className="divide-y divide-muted/30">
                    {otherVehicles
                      .slice(0, MAX_OTHER_VEHICLES_PREVIEW)
                      .map((vehicle) => {
                        const hasCitation = vehicleHasCitation(vehicle, activities);
                        return (
                          <div key={vehicle.id} className="px-3">
                            <VehicleRow
                              vehicle={vehicle}
                              zoneTimeLimit={zone.timeLimit}
                              hasViolation={hasCitation}
                              onAction={(vehicleId, actionType) =>
                                openLogSheet(vehicleId, actionType)
                              }
                              compact
                              now={now}
                            />
                          </div>
                        );
                      })}
                  </div>
                  {hasMoreOtherVehicles && (
                    <button
                      onClick={() => setIsOtherVehiclesSheetOpen(true)}
                      className="w-full px-3 h-11 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-primary hover:bg-muted/50 transition-colors border-t"
                    >
                      <span>View all {otherVehicles.length} vehicles</span>
                      <ChevronRight className="size-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="border bg-card">
                  <div className="flex items-center gap-3 px-3 py-3">
                    <div className="bg-muted p-2">
                      <Car className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      No other vehicles in this zone
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Recent Activity Feed - Preview with View All */}
            <section>
              <div className="border bg-card overflow-hidden">
                <div className="px-3 py-2 border-b bg-muted/20">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Recent Activity
                  </p>
                </div>
                {activities.length > 0 ? (
                  <>
                    <div className="p-3 space-y-1.5">
                      {activities
                        .slice(0, MAX_ACTIVITY_PREVIEW)
                        .map((activity) => {
                          const config = getActivityTypeConfig(activity.type);
                          const summary =
                            config?.summarize(activity) ||
                            `Activity: ${activity.type}`;
                          const timeAgo = formatDistanceToNow(
                            new Date(activity.occurredAt),
                            { addSuffix: true }
                          );
                          return (
                            <div
                              key={activity.id}
                              className="flex items-center gap-2 text-xs leading-tight"
                            >
                              <span className="text-muted-foreground flex-1 truncate">
                                {summary}
                              </span>
                              <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap">
                                {timeAgo}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                    {hasMoreActivity && (
                      <button
                        onClick={() => setIsActivitySheetOpen(true)}
                        className="w-full px-3 h-11 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-primary hover:bg-muted/50 transition-colors border-t"
                      >
                        <span>
                          View all {activities.length} activities
                        </span>
                        <ChevronRight className="size-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-3">
                    <div className="bg-muted p-2">
                      <ClipboardList className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      No activity recorded yet
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-3 pb-safe">
              <div className="mx-auto max-w-md">
                {vehiclesRequiringAttention.length === 0 && (
                  <Button
                    onClick={() => openLogSheet()}
                    variant="outline"
                    className="w-full h-11 text-xs font-bold uppercase tracking-wider"
                    size="default"
                  >
                    Log Other Action
                  </Button>
                )}
                {vehiclesRequiringAttention.length > 0 && (
                  <Button
                    onClick={() => {
                      openLogSheet(undefined, "visit");
                    }}
                    className="w-full shadow-lg h-11 text-xs font-bold uppercase tracking-wider"
                    size="default"
                  >
                    Mark Zone as Reviewed
                  </Button>
                )}
              </div>
            </div>
            <div className="h-16" />

            {/* Log Action Sheet */}
            <LogActionSheet
              zoneId={zoneId}
              vehicles={vehicles}
              zoneTimeLimit={zone.timeLimit}
              open={isLogSheetOpen}
              onOpenChange={handleLogSheetChange}
              onActivityLogged={handleActivityLogged}
              initialVehicleId={initialVehicleId}
              initialActionType={initialActionType}
            />

            {/* Other Vehicles Sheet */}
            <Sheet
              open={isOtherVehiclesSheetOpen}
              onOpenChange={setIsOtherVehiclesSheetOpen}
            >
              <SheetContent side="bottom" className="max-h-[85vh] px-4">
                <SheetHeader>
                  <SheetTitle>All Vehicles</SheetTitle>
                  <SheetDescription>
                    {otherVehicles.length} vehicles with no current issues
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 divide-y -mx-2">
                  {otherVehicles.map((vehicle) => {
                    const hasCitation = vehicleHasCitation(vehicle, activities);
                    return (
                      <div key={vehicle.id} className="px-2">
                        <VehicleRow
                          vehicle={vehicle}
                          zoneTimeLimit={zone.timeLimit}
                          hasViolation={hasCitation}
                          onAction={(vehicleId, actionType) => {
                            setIsOtherVehiclesSheetOpen(false);
                            openLogSheet(vehicleId, actionType);
                          }}
                          compact
                          now={now}
                        />
                      </div>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            {/* Activity Sheet */}
            <Sheet
              open={isActivitySheetOpen}
              onOpenChange={setIsActivitySheetOpen}
            >
              <SheetContent side="bottom" className="max-h-[85vh] px-4">
                <SheetHeader>
                  <SheetTitle>Recent Activity</SheetTitle>
                  <SheetDescription>
                    All recorded activity for this zone
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                  {activities.map((activity) => {
                    const config = getActivityTypeConfig(activity.type);
                    const summary =
                      config?.summarize(activity) ||
                      `Activity: ${activity.type}`;
                    const timeAgo = formatDistanceToNow(
                      new Date(activity.occurredAt),
                      { addSuffix: true }
                    );
                    const Icon = config?.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                      >
                        {Icon && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{summary}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {timeAgo}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : null}
      </ApiStateBoundary>
    </div>
  );
}
