"use client";

import { useState, useEffect } from "react";
import { Vehicle } from "@/lib/types";
import { logActivity } from "@/lib/api";
import { getAllActivityTypes } from "@/lib/activity-types";
import { isVehicleOverstay } from "@/lib/compute";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { RefreshCw, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogActionSheetProps {
  zoneId: string;
  vehicles: Vehicle[];
  zoneTimeLimit: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityLogged: () => void;
  initialVehicleId?: string;
  initialActionType?: string;
}

export function LogActionSheet({
  zoneId,
  vehicles,
  zoneTimeLimit,
  open,
  onOpenChange,
  onActivityLogged,
  initialVehicleId,
  initialActionType,
}: LogActionSheetProps) {
  const activityTypes = getAllActivityTypes();
  const [selectedType, setSelectedType] = useState<string>(initialActionType || "");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicleId || "none");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVehiclePopoverOpen, setIsVehiclePopoverOpen] = useState(false);

  // Update selection when props change (e.g. when opening from a specific vehicle)
  useEffect(() => {
    if (open) {
      setSelectedVehicleId(initialVehicleId || "none");
      setSelectedType(initialActionType || "");
    }
  }, [open, initialVehicleId, initialActionType]);

  const selectedTypeConfig = activityTypes.find((t) => t.type === selectedType);

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error("Please select an action type");
      return;
    }

    // Validate required fields
    if (selectedTypeConfig?.formFields.vehicleId?.required) {
      if (!selectedVehicleId || selectedVehicleId === "none") {
        toast.error("Please select a vehicle for this action");
        return;
      }
    }
    if (selectedTypeConfig?.formFields.notes?.required && !notes.trim()) {
      toast.error(
        selectedTypeConfig.formFields.notes.label || "Notes are required"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {};

      // Add vehicle info if the type supports it and one is selected
      if (
        selectedTypeConfig?.formFields.vehicleId &&
        selectedVehicleId &&
        selectedVehicleId !== "none"
      ) {
        const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
        payload.vehicleId = selectedVehicleId;
        if (vehicle) {
          payload.licensePlate = vehicle.licensePlate;
        }
      }

      // Add notes if provided or required
      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      await logActivity({
        zoneId,
        type: selectedType,
        payload,
        occurredAt: new Date().toISOString(),
      });

      toast.success("Activity logged successfully");

      // Reset form
      setSelectedType("");
      setSelectedVehicleId("none");
      setNotes("");

      onActivityLogged();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to log activity"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedType("");
      setSelectedVehicleId("none");
      setNotes("");
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="max-h-[85vh] px-4">
        <SheetHeader>
          <SheetTitle>Log Field Action</SheetTitle>
          <SheetDescription>
            Record enforcement actions or status updates for this zone.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-3 flex flex-col gap-4 pb-4">
          {/* Action Type Selection - Full Width List */}
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold uppercase text-muted-foreground">
              Action Type
            </Label>
            <div className="flex flex-col gap-1.5">
              {activityTypes.map((type) => (
                <button
                  key={type.type}
                  type="button"
                  onClick={() => setSelectedType(type.type)}
                  className={cn(
                    "flex items-center p-2 rounded-none border transition-all gap-2.5 w-full text-left",
                    selectedType === type.type
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-muted bg-card hover:border-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-none",
                      selectedType === type.type
                        ? "bg-primary text-primary-foreground"
                        : type.type === "citation" || type.type === "tow"
                        ? "bg-destructive/10 text-destructive"
                        : type.type === "visit" || type.type === "check-in"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <type.icon className="size-3.5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="text-xs font-bold">{type.label}</span>
                    <span className="text-[11px] opacity-70 line-clamp-1">
                      {type.description}
                    </span>
                  </div>
                  {selectedType === type.type && (
                    <div className="ml-auto">
                      <Check className="size-3.5 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Selection */}
          {selectedTypeConfig?.formFields.vehicleId && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="vehicle" className="text-[11px] font-bold uppercase text-muted-foreground">
                {selectedTypeConfig.formFields.vehicleId.label}
                {selectedTypeConfig.formFields.vehicleId.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {vehicles.length === 0 ? (
                <div className="rounded-none border border-dashed p-3 text-center text-[11px] text-muted-foreground">
                  No vehicles in this zone
                </div>
              ) : (
                <Popover
                  open={isVehiclePopoverOpen}
                  onOpenChange={setIsVehiclePopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isVehiclePopoverOpen}
                      className="w-full h-11 justify-between px-3 text-xs"
                    >
                      {selectedVehicleId && selectedVehicleId !== "none" ? (
                        (() => {
                          const vehicle = vehicles.find(
                            (v) => v.id === selectedVehicleId
                          );
                          return vehicle ? (
                              <div className="flex items-center justify-between w-full gap-2">
                                <span className="font-bold leading-tight truncate">
                                  {vehicle.licensePlate}
                                </span>
                                {isVehicleOverstay(vehicle, zoneTimeLimit) && (
                                  <Badge
                                    variant="destructive"
                                    className="shrink-0 text-[11px] h-5 px-1.5 py-0 font-bold"
                                  >
                                    OVERSTAY
                                  </Badge>
                                )}
                              </div>
                          ) : (
                            "Select vehicle..."
                          );
                        })()
                      ) : (
                        <span className="text-muted-foreground">
                          Select vehicle...
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command
                      filter={(value, search) => {
                        const vehicle = vehicles.find((v) => v.id === value);
                        if (!vehicle && value === "none") {
                          return "none / other".includes(search.toLowerCase())
                            ? 1
                            : 0;
                        }
                        if (!vehicle) return 0;
                        const content =
                          `${vehicle.licensePlate}`.toLowerCase();
                        return content.includes(search.toLowerCase()) ? 1 : 0;
                      }}
                    >
                      <CommandInput placeholder="Search license plate..." className="h-11 text-xs" />
                      <CommandList className="max-h-48">
                        <CommandEmpty className="text-[11px] py-4">No vehicle found.</CommandEmpty>
                        <CommandGroup>
                          {vehicles.map((vehicle) => (
                            <CommandItem
                              key={vehicle.id}
                              value={vehicle.id}
                              onSelect={() => {
                                setSelectedVehicleId(vehicle.id);
                                setIsVehiclePopoverOpen(false);
                              }}
                              className="px-2 py-1.5"
                            >
                              <Check
                                className={cn(
                                  "mr-2 size-3.5",
                                  selectedVehicleId === vehicle.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex items-center justify-between w-full gap-2">
                                <span className="font-bold text-xs truncate">
                                  {vehicle.licensePlate}
                                </span>
                                {isVehicleOverstay(vehicle, zoneTimeLimit) && (
                                  <Badge
                                    variant="destructive"
                                    className="shrink-0 text-[11px] h-5 px-1.5 py-0 font-bold"
                                  >
                                    OVERSTAY
                                  </Badge>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          )}

          {/* Notes */}
          {selectedTypeConfig?.formFields.notes && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes" className="text-[11px] font-bold uppercase text-muted-foreground">
                {selectedTypeConfig.formFields.notes.label}
                {selectedTypeConfig.formFields.notes.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Textarea
                id="notes"
                placeholder={selectedTypeConfig.formFields.notes.placeholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                autoComplete="off"
                className="text-xs min-h-[60px] p-2 resize-none"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col gap-2 pt-4 border-t mt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedType}
              className="w-full h-11 text-sm font-bold"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Logging…
                </>
              ) : (
                "Complete Action"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full h-11 text-xs text-muted-foreground"
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
