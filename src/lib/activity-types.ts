// Activity type registry - extensible configuration for activity logging
import { Activity } from "./types";
import {
  LucideIcon,
  MapPin,
  AlertTriangle,
  FileText,
  Truck,
} from "lucide-react";

export interface ActivityTypeConfig {
  type: string;
  label: string;
  icon: LucideIcon;
  description: string;
  // Form field configuration
  formFields: {
    vehicleId?: {
      label: string;
      required: boolean;
    };
    notes?: {
      label: string;
      required: boolean;
      placeholder: string;
    };
  };
  // How to summarize this activity in the recent activity list
  summarize: (activity: Activity) => string;
}

export const activityTypes: Record<string, ActivityTypeConfig> = {
  visit: {
    type: "visit",
    label: "Log Visit",
    icon: MapPin,
    description: "Record that you visited this zone",
    formFields: {
      notes: {
        label: "Notes",
        required: false,
        placeholder: "Optional notes about your visit...",
      },
    },
    summarize: (activity) => {
      const notes = activity.payload.notes as string | undefined;
      return notes
        ? `Visited zone: ${notes}`
        : "Visited zone";
    },
  },
  warning: {
    type: "warning",
    label: "Issue Warning",
    icon: AlertTriangle,
    description: "Issue a warning to a vehicle",
    formFields: {
      vehicleId: {
        label: "Vehicle",
        required: false,
      },
      notes: {
        label: "Notes",
        required: false,
        placeholder: "Optional details about the warning...",
      },
    },
    summarize: (activity) => {
      const licensePlate = activity.payload.licensePlate as string | undefined;
      const notes = activity.payload.notes as string | undefined;
      const parts = ["Issued warning"];
      if (licensePlate) {
        parts.push(`to ${licensePlate}`);
      }
      if (notes) parts.push(`: ${notes}`);
      return parts.join(" ");
    },
  },
  citation: {
    type: "citation",
    label: "Issue Citation",
    icon: FileText,
    description: "Issue a parking citation to a vehicle",
    formFields: {
      vehicleId: {
        label: "Vehicle",
        required: true,
      },
      notes: {
        label: "Citation Details",
        required: false,
        placeholder: "Optional citation details or violation code...",
      },
    },
    summarize: (activity) => {
      const licensePlate = activity.payload.licensePlate as string | undefined;
      const notes = activity.payload.notes as string | undefined;
      const parts = ["Issued citation"];
      if (licensePlate) {
        parts.push(`to ${licensePlate}`);
      }
      if (notes) parts.push(`: ${notes}`);
      return parts.join(" ");
    },
  },
  tow: {
    type: "tow",
    label: "Request Tow",
    icon: Truck,
    description: "Request a tow truck for a vehicle",
    formFields: {
      vehicleId: {
        label: "Vehicle",
        required: true,
      },
      notes: {
        label: "Tow Details",
        required: false,
        placeholder: "Optional tow reason or special instructions...",
      },
    },
    summarize: (activity) => {
      const licensePlate = activity.payload.licensePlate as string | undefined;
      const notes = activity.payload.notes as string | undefined;
      const parts = ["Requested tow"];
      if (licensePlate) {
        parts.push(`for ${licensePlate}`);
      }
      if (notes) parts.push(`: ${notes}`);
      return parts.join(" ");
    },
  },
};

export function getActivityTypeConfig(type: string): ActivityTypeConfig | undefined {
  return activityTypes[type]
}

export function getAllActivityTypes(): ActivityTypeConfig[] {
  return Object.values(activityTypes)
}
