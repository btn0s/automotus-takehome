import { NextRequest, NextResponse } from 'next/server'
import { mockZones, getVehiclesForZone, getActivitiesForZone } from '@/lib/mock-data'
import { ZoneDetailResponse } from '@/lib/types'
import { getActivitiesForZone as getStoredActivitiesForZone } from '@/lib/activity-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;

  if (searchParams.get("error") === "true") {
    return NextResponse.json(
      { error: "Simulated API error for demo purposes" },
      { status: 500 }
    );
  }

  const zone = mockZones.find((z) => z.id === id);

  if (!zone) {
    return NextResponse.json({ error: "Zone not found" }, { status: 404 });
  }

  const vehicles = getVehiclesForZone(id);
  const mockActivities = getActivitiesForZone(id);
  const storedActivities = getStoredActivitiesForZone(id);
  const activities = [...storedActivities, ...mockActivities].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return NextResponse.json<ZoneDetailResponse>({
    zone: { ...zone, vehicles, activities },
  });
}
