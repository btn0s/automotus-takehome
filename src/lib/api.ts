// API client wrapper - centralizes fetch calls with error handling and demo toggles
import {
  ZonesResponse,
  ZoneDetailResponse,
  ActivityLogRequest,
  ActivityResponse,
} from './types'

const API_BASE = '/api'

// Helper to get query params from current page URL (for demo toggles)
function getPageQueryParams(): URLSearchParams {
  if (typeof window === 'undefined') {
    return new URLSearchParams()
  }
  return new URLSearchParams(window.location.search);
}

// Wrapper for fetch that handles errors and propagates demo toggles
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const pageParams = getPageQueryParams();

  // Build URL with page query params (error/empty) if present
  const urlObj = new URL(url, window.location.origin);
  if (pageParams.has("error")) {
    urlObj.searchParams.set("error", pageParams.get("error")!);
  }
  if (pageParams.has("empty")) {
    urlObj.searchParams.set("empty", pageParams.get("empty")!);
  }

  // Preserve existing query params from endpoint
  const endpointUrl = new URL(endpoint, window.location.origin);
  endpointUrl.searchParams.forEach((value, key) => {
    urlObj.searchParams.set(key, value);
  });

  const finalUrl = urlObj.pathname + urlObj.search;

  const response = await fetch(finalUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // Try to parse error response as JSON, fallback to text
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      const errorText = await response.text().catch(() => response.statusText);
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  return response.json()
}

// API functions
export async function getZones(priority: 'high' | 'all' = 'high'): Promise<ZonesResponse> {
  const query = priority === 'high' ? '?priority=high' : '?priority=all'
  return apiFetch<ZonesResponse>(`/zones${query}`)
}

export async function getZoneDetail(id: string): Promise<ZoneDetailResponse> {
  return apiFetch<ZoneDetailResponse>(`/zones/${id}`)
}

export async function logActivity(data: ActivityLogRequest): Promise<ActivityResponse> {
  return apiFetch<ActivityResponse>('/activity', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

