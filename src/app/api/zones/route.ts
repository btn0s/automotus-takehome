import { NextRequest, NextResponse } from 'next/server'
import {
  mockZones,
  getVehiclesForZone,
  getActivitiesForZone,
} from "@/lib/mock-data";
import { getActivitiesForZone as getStoredActivitiesForZone } from '@/lib/activity-store'
import { ZonesResponse, ZoneWithDetails } from '@/lib/types'
import { computeOccupancy, computeViolationCount, zoneRequiresAttention } from '@/lib/compute'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  if (searchParams.get("error") === "true") {
    return NextResponse.json(
      { error: "Simulated API error for demo purposes" },
      { status: 500 }
    );
  }

  if (searchParams.get("empty") === "true") {
    return NextResponse.json<ZonesResponse>({
      zones: [],
      lastUpdated: new Date().toISOString(),
    });
  }

  const priority = searchParams.get("priority") || "high";

  const zonesWithDetails: (ZoneWithDetails & { priorityScore: number })[] = mockZones.map((zone) => {
    const mockActivities = getActivitiesForZone(zone.id);
    const storedActivities = getStoredActivitiesForZone(zone.id);
    const vehicles = getVehiclesForZone(zone.id);
    const activities = [...storedActivities, ...mockActivities].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );

    const occupancy = computeOccupancy(vehicles);
    const violationCount = computeViolationCount(vehicles, zone.timeLimit, activities);
    const priorityScore = Math.round((violationCount * 10 + (occupancy / zone.maxCapacity) * 5) * 100) / 100;

    return { ...zone, vehicles, activities, priorityScore };
  });

  let filteredZones: ZoneWithDetails[];
  if (priority === "high") {
    filteredZones = zonesWithDetails
      .filter((z) => zoneRequiresAttention(z.vehicles, z.timeLimit, z.maxCapacity, z.activities))
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .map(({ priorityScore, ...zone }) => zone);
  } else {
    filteredZones = zonesWithDetails
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .map(({ priorityScore, ...zone }) => zone);
  }

  return NextResponse.json<ZonesResponse>({
    zones: filteredZones,
    lastUpdated: new Date().toISOString(),
  });
}
