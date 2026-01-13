export interface Zone {
  id: string
  name: string
  location: string
  maxCapacity: number
  timeLimit: number
}

export interface Vehicle {
  id: string
  zoneId: string
  licensePlate: string
  type: "car" | "truck" | "motorcycle"
  arrivalTime: string
  timeLimit: number
}

export interface Activity {
  id: string
  zoneId: string
  type: string
  payload: Record<string, unknown>
  occurredAt: string
}

export interface ZoneWithDetails extends Zone {
  vehicles: Vehicle[]
  activities: Activity[]
}

export interface ActivityLogRequest {
  zoneId: string
  type: string
  payload: Record<string, unknown>
  occurredAt: string
}

export interface ZonesResponse {
  zones: ZoneWithDetails[]
  lastUpdated: string
}

export interface ZoneDetailResponse {
  zone: ZoneWithDetails
}

export interface ActivityResponse {
  activity: Activity
}
