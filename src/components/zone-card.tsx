"use client";

import Link from "next/link";
import { Zone } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZoneCardProps {
  zone: Zone;
  occupancy: number; // Computed in frontend from vehicles data
  violationCount?: number; // Computed in frontend from activities (citations/warnings) and overstays
  priority?: boolean;
  compact?: boolean;
  noBorder?: boolean;
}

export function ZoneCard({ zone, occupancy, violationCount = 0, priority, compact, noBorder }: ZoneCardProps) {
  const hasViolations = violationCount > 0;
  const occupancyPercent = Math.round(
    (occupancy / zone.maxCapacity) * 100
  );
  const isHighOccupancy = occupancyPercent >= 85;

  // Compact view for non-urgent zones
  if (compact) {
    return (
      <Link href={`/zones/${zone.id}`}>
        <Card className={cn(
          "transition-[ring,shadow] hover:ring-1 hover:ring-primary/20 hover:shadow-sm bg-background",
          noBorder && "ring-0 shadow-none border-0 hover:ring-0"
        )}>
          <CardHeader className="py-2 px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold leading-tight">
                {zone.name}
              </CardTitle>
              <CardAction>
                <ChevronRight
                  className="size-3 text-muted-foreground/30"
                  aria-hidden="true"
                />
              </CardAction>
            </div>
          </CardHeader>
        </Card>
      </Link>
    );
  }

  const badges = [];

  // Alerts always come first (primary signal)
  if (hasViolations) {
    badges.push(
      <Badge
        key="alerts"
        variant="outline"
        className="flex items-center gap-1 px-1.5 py-0 text-[10px] font-semibold bg-red-50 text-red-700 border-red-200"
      >
        <span>
          {violationCount} {violationCount === 1 ? "Alert" : "Alerts"}
        </span>
      </Badge>
    );
  }

  // Capacity always present (supporting context)
  badges.push(
    <Badge
      key="occupancy"
      variant="outline"
      className={cn(
        "px-1.5 py-0 text-[10px] font-semibold",
        isHighOccupancy && "border-orange-200 text-orange-700 bg-orange-50"
      )}
    >
      {occupancy} / {zone.maxCapacity} spots
    </Badge>
  );

  return (
    <Link href={`/zones/${zone.id}`}>
      <Card
        className={cn(
          "transition-[ring,shadow] hover:ring-1 hover:ring-primary/20 hover:shadow-sm bg-background",
          priority && !noBorder && "border border-destructive/30 bg-destructive/5 shadow-none",
          noBorder && "ring-0 shadow-none border-0 hover:ring-0"
        )}
      >
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <CardTitle className="text-base font-bold leading-tight">{zone.name}</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground leading-none">
                <MapPin className="size-3" aria-hidden="true" />
                <span>{zone.location}</span>
              </div>
            </div>
            <CardAction>
              <ChevronRight
                className="size-4 text-muted-foreground/30"
                aria-hidden="true"
              />
            </CardAction>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">{badges}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
