"use client";

import { Vehicle } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Car, Truck, Bike, MoreVertical, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getMinutesParked } from "@/lib/compute";

interface VehicleRowProps {
  vehicle: Vehicle;
  zoneTimeLimit: number;
  hasViolation?: boolean;
  onAction?: (vehicleId: string, actionType?: string) => void;
  showQuickActions?: boolean;
  compact?: boolean;
  now?: number;
}

export function VehicleRow({
  vehicle,
  zoneTimeLimit,
  hasViolation = false,
  onAction,
  showQuickActions,
  compact,
  now = Date.now(),
}: VehicleRowProps) {
  const minutesParked = Math.floor(getMinutesParked(vehicle, now));
  const minutesOver = minutesParked - zoneTimeLimit;
  const isDue = minutesOver >= 0;
  const isOverstay = minutesOver > 0;

  const VehicleIcon =
    vehicle.type === "truck"
      ? Truck
      : vehicle.type === "motorcycle"
      ? Bike
      : Car;

  // Compact view for non-urgent vehicles
  if (compact) {
    return (
      <div className="flex items-center justify-between py-2 group border-b border-muted/30 last:border-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-muted p-1.5 size-7 flex items-center justify-center">
            <VehicleIcon
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-xs">
              {vehicle.licensePlate}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wide">
              <Clock className="size-3" aria-hidden="true" />
              <span>{minutesParked} / {zoneTimeLimit} min</span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <MoreVertical className="size-3.5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction?.(vehicle.id, "warning")} className="text-xs">
              <AlertCircle className="mr-2 size-3.5" />
              <span>Issue Warning</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction?.(vehicle.id, "citation")}
              className="text-xs"
            >
              <FileText className="mr-2 size-3.5" />
              <span>Issue Citation</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction?.(vehicle.id)} className="text-xs">
              <span>Other Action...</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-3 border-b last:border-0 border-muted/30">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2.5">
          <div className="bg-muted p-2 size-10 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
            <VehicleIcon
              className="size-5 text-muted-foreground group-hover:text-primary transition-colors"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {vehicle.licensePlate}
              </span>
              {(hasViolation || isDue) && (
                  <Badge
                    variant={hasViolation ? "outline" : "destructive"}
                    className={cn(
                      "text-[11px] px-1.5 py-0 h-5 font-semibold",
                      hasViolation && "border-amber-600 text-amber-700 bg-amber-50"
                    )}
                  >
                    {hasViolation ? "Cited" : isOverstay ? "Overstay" : "At limit"}
                  </Badge>
              )}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wide">
                <Clock className="size-3" aria-hidden="true" />
                <span>{minutesParked} / {zoneTimeLimit} min</span>
              </div>
            </div>
          </div>
        </div>

        {!showQuickActions && (
          <div className="flex items-center gap-1.5">
            {isOverstay && (
              <div className="flex size-7 items-center justify-center bg-destructive/10">
                <AlertTriangle
                  className="size-3.5 text-destructive"
                  aria-hidden="true"
                />
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                  <MoreVertical className="size-3.5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase">
                  {vehicle.licensePlate}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onAction?.(vehicle.id, "warning")}
                  className="text-xs"
                >
                  <AlertCircle className="mr-2 size-3.5" />
                  <span>Issue Warning</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction?.(vehicle.id, "citation")}
                  className="text-xs"
                >
                  <FileText className="mr-2 size-3.5" />
                  <span>Issue Citation</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction?.(vehicle.id, "tow")} className="text-xs">
                  <Truck className="mr-2 size-3.5" />
                  <span>Request Tow</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAction?.(vehicle.id)} className="text-xs">
                  <span>Other Action...</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {showQuickActions && (hasViolation || isDue) && (
        <div className="flex gap-2 mt-2">
          {hasViolation ? (
            <Button
              onClick={() => onAction?.(vehicle.id, "tow")}
              className="flex-1 h-11 text-xs font-bold"
              variant="outline"
            >
              <Truck className="mr-1.5 size-4" />
              Request Tow
            </Button>
          ) : isOverstay ? (
            <>
              <Button
                onClick={() => onAction?.(vehicle.id, "citation")}
                className="flex-1 h-11 text-xs font-bold"
                variant="default"
              >
                <FileText className="mr-1.5 size-4" />
                Issue Citation
              </Button>
              <Button
                onClick={() => onAction?.(vehicle.id, "warning")}
                className="flex-1 h-11 text-xs font-bold"
                variant="outline"
              >
                <AlertCircle className="mr-1.5 size-4" />
                Issue Warning
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onAction?.(vehicle.id, "warning")}
              className="flex-1 h-11 text-xs font-bold"
              variant="outline"
            >
              <AlertCircle className="mr-1.5 size-4" />
              Issue Warning
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
