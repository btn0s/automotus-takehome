// File-based persistence for activities
// Uses a JSON file stored in the project root for simplicity
import { Activity } from './types'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')
const ACTIVITIES_FILE = join(DATA_DIR, 'activities.json')

// Ensure data directory exists
function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Read activities from file
function readActivities(): Activity[] {
  ensureDataDir()
  if (!existsSync(ACTIVITIES_FILE)) {
    return []
  }
  try {
    const data = readFileSync(ACTIVITIES_FILE, 'utf-8')
    return JSON.parse(data) as Activity[]
  } catch (error) {
    console.error('Error reading activities file:', error)
    return []
  }
}

// Write activities to file
function writeActivities(activities: Activity[]): void {
  ensureDataDir()
  try {
    writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing activities file:', error)
    throw error
  }
}

export function addActivity(activity: Activity): void {
  const activities = readActivities()
  activities.push(activity)
  writeActivities(activities)
}

export function getActivitiesForZone(zoneId: string): Activity[] {
  const activities = readActivities()
  return activities.filter((a) => a.zoneId === zoneId)
}

export function getAllActivities(): Activity[] {
  return readActivities()
}
