import { NextRequest, NextResponse } from 'next/server'
import { ActivityLogRequest, ActivityResponse, Activity } from '@/lib/types'
import { addActivity } from '@/lib/activity-store'
import { activityTypes } from '@/lib/activity-types'

const VALID_ACTIVITY_TYPES = Object.keys(activityTypes)

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Check for error simulation
  if (searchParams.get("error") === "true") {
    return NextResponse.json(
      { error: "Simulated API error for demo purposes" },
      { status: 500 }
    );
  }

  try {
    const body: ActivityLogRequest = await request.json();

    // Validate required fields
    if (!body.zoneId || !body.type || !body.occurredAt) {
      return NextResponse.json(
        { error: "Missing required fields: zoneId, type, occurredAt" },
        { status: 400 }
      );
    }

    if (!VALID_ACTIVITY_TYPES.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid activity type: ${body.type}. Valid types: ${VALID_ACTIVITY_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Create activity
    const activity: Activity = {
      id: `activity-${Date.now()}`,
      zoneId: body.zoneId,
      type: body.type,
      payload: body.payload || {},
      occurredAt: body.occurredAt,
    };

    // Store activity (in real app, this would be persisted to database)
    addActivity(activity);

    return NextResponse.json<ActivityResponse>({ activity });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
