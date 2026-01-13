import { Vehicle, Activity } from './types'

export function getMinutesParked(vehicle: Vehicle, now: number = Date.now()): number {
  return (now - new Date(vehicle.arrivalTime).getTime()) / (60 * 1000);
}

export function isVehicleOverstay(vehicle: Vehicle, zoneTimeLimit: number, now: number = Date.now()): boolean {
  return getMinutesParked(vehicle, now) > zoneTimeLimit;
}

export function vehicleHasCitation(vehicle: Vehicle, activities: Activity[]): boolean {
  return activities.some(
    (act) => (act.type === "citation" || act.type === "warning") &&
             act.payload.vehicleId === vehicle.id
  );
}

export function vehicleRequiresAttention(
  vehicle: Vehicle,
  zoneTimeLimit: number,
  activities: Activity[],
  now: number = Date.now()
): boolean {
  return vehicleHasCitation(vehicle, activities) || isVehicleOverstay(vehicle, zoneTimeLimit, now);
}

export function computeOccupancy(vehicles: Vehicle[]): number {
  return vehicles.reduce(
    (total, vehicle) => total + (vehicle.type === "truck" ? 2 : 1),
    0
  );
}

export function computeViolationCount(
  vehicles: Vehicle[],
  zoneTimeLimit: number,
  activities: Activity[],
  now: number = Date.now()
): number {
  return vehicles.filter((v) => vehicleRequiresAttention(v, zoneTimeLimit, activities, now)).length;
}

export function zoneRequiresAttention(
  vehicles: Vehicle[],
  zoneTimeLimit: number,
  maxCapacity: number,
  activities: Activity[],
  now: number = Date.now()
): boolean {
  const violationCount = computeViolationCount(vehicles, zoneTimeLimit, activities, now);
  const occupancy = computeOccupancy(vehicles);
  return violationCount > 0 || occupancy / maxCapacity > 0.8;
}
