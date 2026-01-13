import { Zone, Vehicle, Activity } from './types'

// Zone definitions with realistic capacities
// occupancyPercent: what % of capacity is filled (60-95%)
// attentionPercent: what % of occupied spots need attention (0-15%)
const zoneDefinitions = [
  { id: "zone-1", name: "Downtown Main St", location: "Main St & 1st Ave", maxCapacity: 50, occupancyPercent: 85, attentionPercent: 8, timeLimit: 120 },
  { id: "zone-2", name: "Parking Garage A", location: "2nd St & Commerce", maxCapacity: 200, occupancyPercent: 75, attentionPercent: 5, timeLimit: 120 },
  { id: "zone-3", name: "Residential Zone B", location: "Oak Ave & Elm St", maxCapacity: 15, occupancyPercent: 70, attentionPercent: 12, timeLimit: 60 },
  { id: "zone-4", name: "Commercial District", location: "Market St & 5th Ave", maxCapacity: 80, occupancyPercent: 90, attentionPercent: 6, timeLimit: 120 },
  { id: "zone-5", name: "University Lot C", location: "Campus Dr & College Ave", maxCapacity: 150, occupancyPercent: 65, attentionPercent: 0, timeLimit: 180 },
  { id: "zone-6", name: "Transit Station", location: "Station Plaza", maxCapacity: 300, occupancyPercent: 40, attentionPercent: 0, timeLimit: 120 },
  { id: "zone-7", name: "City Hall Parking", location: "Government Center", maxCapacity: 30, occupancyPercent: 80, attentionPercent: 10, timeLimit: 60 },
] as const;

interface GeneratedData {
  zones: Zone[];
  vehicles: Vehicle[];
  activities: Activity[];
}

function generateMockData(): GeneratedData {
  const vehicles: Vehicle[] = [];
  const zones: Zone[] = [];
  let vehicleIdCounter = 1;

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  function generateVehiclesForZone(
    zoneId: string,
    targetOccupancy: number,
    zoneTimeLimit: number,
    overstayCount: number
  ): Vehicle[] {
    const zoneVehicles: Vehicle[] = [];
    let currentOccupancy = 0;
    let localVehicleId = vehicleIdCounter;
    const now = Date.now();

    for (let i = 0; i < overstayCount && currentOccupancy < targetOccupancy; i++) {
      const plateNum = localVehicleId;
      const licensePlate = generatePlate(plateNum);
      const type = getVehicleType(plateNum, targetOccupancy - currentOccupancy);
      
      const overstayMinutes = 10 + (plateNum % 50);
      const minutesAgo = zoneTimeLimit + overstayMinutes;
      
      zoneVehicles.push({
        id: `vehicle-${localVehicleId}`,
        zoneId,
        licensePlate,
        type,
        arrivalTime: new Date(now - minutesAgo * 60 * 1000).toISOString(),
        timeLimit: zoneTimeLimit,
      });

      currentOccupancy += type === "truck" ? 2 : 1;
      localVehicleId++;
    }

    while (currentOccupancy < targetOccupancy) {
      const plateNum = localVehicleId;
      const licensePlate = generatePlate(plateNum);
      const type = getVehicleType(plateNum, targetOccupancy - currentOccupancy);
      
      const percentElapsed = 0.1 + ((plateNum * 7) % 80) / 100;
      const minutesAgo = zoneTimeLimit * percentElapsed;
      
      zoneVehicles.push({
        id: `vehicle-${localVehicleId}`,
        zoneId,
        licensePlate,
        type,
        arrivalTime: new Date(now - minutesAgo * 60 * 1000).toISOString(),
        timeLimit: zoneTimeLimit,
      });

      currentOccupancy += type === "truck" ? 2 : 1;
      localVehicleId++;
      
      if (localVehicleId > vehicleIdCounter + 100) break;
    }

    vehicleIdCounter = localVehicleId;
    return zoneVehicles;
  }

  function generatePlate(num: number): string {
    const letter1 = letters[num % letters.length];
    const letter2 = letters[(num * 7) % letters.length];
    const letter3 = letters[(num * 13) % letters.length];
    const num1 = numbers[(num * 3) % numbers.length];
    const num2 = numbers[(num * 5) % numbers.length];
    const num3 = numbers[(num * 11) % numbers.length];
    const num4 = numbers[(num * 17) % numbers.length];
    return `${letter1}${letter2}${letter3}-${num1}${num2}${num3}${num4}`;
  }

  function getVehicleType(seed: number, remainingSpots: number): "car" | "truck" | "motorcycle" {
    const rand = (seed * 7) % 100;
    if (remainingSpots >= 2 && rand < 10) return "truck";
    if (rand < 15) return "motorcycle";
    return "car";
  }

  for (const def of zoneDefinitions) {
    const targetOccupancy = Math.round(def.maxCapacity * def.occupancyPercent / 100);
    const overstayCount = Math.round(targetOccupancy * def.attentionPercent / 100);
    const zoneVehicles = generateVehiclesForZone(def.id, targetOccupancy, def.timeLimit, overstayCount);
    vehicles.push(...zoneVehicles);
  }

  for (const def of zoneDefinitions) {
    zones.push({
      id: def.id,
      name: def.name,
      location: def.location,
      maxCapacity: def.maxCapacity,
      timeLimit: def.timeLimit,
    });
  }

  const activities: Activity[] = [
    {
      id: "activity-1",
      zoneId: "zone-1",
      type: "visit",
      payload: { notes: "Routine check completed" },
      occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "activity-3",
      zoneId: "zone-2",
      type: "visit",
      payload: {},
      occurredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "activity-5",
      zoneId: "zone-2",
      type: "visit",
      payload: { notes: "Evening patrol" },
      occurredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return { zones, vehicles, activities };
}

const generated = generateMockData();

export const mockZones = generated.zones;
export const mockVehicles = generated.vehicles;
export const mockActivities = generated.activities;

export function getVehiclesForZone(zoneId: string): Vehicle[] {
  return mockVehicles.filter((v) => v.zoneId === zoneId)
}

export function getActivitiesForZone(zoneId: string): Activity[] {
  return mockActivities.filter((a) => a.zoneId === zoneId)
}
