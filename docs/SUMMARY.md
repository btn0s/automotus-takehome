# Written Summary

## What I Prioritized and Why

I built three coherent features that map directly to the officer workflow described in the prompt: **zone prioritization**, **zone context**, and **activity logging**.

The zone list answers "where should I go next?" by surfacing zones with violations or high occupancy at the top, visually separated from clear zones. This mirrors how officers think—address problems first. I invested heavily here because getting prioritization wrong makes the app less useful than paper lists.

Zone detail provides the context officers need before taking action: which vehicles are overstaying, which have already been cited, what actions have been taken recently, and current capacity. The UI groups vehicles into "Requires Attention" (overstays and cited vehicles) and "Other Vehicles" so officers can scan quickly.

Activity logging closes the loop. Officers can record zone visits, issue warnings, cite vehicles, and request tows directly from vehicle rows. The form is minimal—action type plus optional notes—because field work demands speed over completeness.

## What I Cut and Why

**Authentication** adds complexity without demonstrating core workflow. The prototype assumes a single logged-in officer.

**Maps and navigation** would require significant integration (GPS, directions, map rendering) for marginal demo value. Officers already know their patrol routes—the app helps them prioritize, not navigate.

**Real-time updates and multi-officer coordination** are production requirements but don't add value to a single-user prototype. The mock API simulates realistic latency without WebSocket complexity.

**Historical analytics and reporting** serve supervisors, not field officers making immediate decisions. Out of scope for "what do I do next?"

**Detailed vehicle pages** were cut because inline vehicle rows provide enough context (plate, time parked, violation status) to take action without extra navigation.

## Assumptions About User Needs

I assumed officers work sequentially through zones rather than jumping randomly, which informed the clear visual hierarchy separating "requires attention" from "other zones."

I assumed officers want to minimize screen time—hence scannable cards, prominent violation indicators, and quick action buttons directly on vehicle rows. Large touch targets (44px minimum) support use while walking.

I assumed activity logging happens immediately after real-world action, so the form prioritizes speed: select action type, optionally select vehicle, optionally add notes, submit.

I assumed zones have consistent time limits (e.g., 2-hour parking), so time limit is a zone property rather than per-vehicle. This simplifies both the data model and UI.

## API Design Approach and Tradeoffs

I chose **Next.js API routes** because they provide real HTTP endpoints without additional infrastructure. The frontend calls `fetch()` to these endpoints exactly like it would in production—no imported JSON files or mock service workers.

The API returns **nested data** (zones contain their vehicles and activities) rather than separate endpoints that require client-side joining. This reduces round trips and simplifies the client, at the cost of larger payloads. For a mobile app where latency matters more than bandwidth, this tradeoff makes sense.

Business logic lives in a shared `compute.ts` module that both API routes and UI components import. Functions like `vehicleRequiresAttention()` and `zoneRequiresAttention()` ensure consistent behavior between server-side filtering and client-side display. The tradeoff is running the same computation twice, but for a prototype, code reuse and consistency outweigh minor duplication.

Error and empty states are triggered via query parameters (`?error=true`, `?empty=true`) that the API client checks before making requests. This makes demo states easy to show without code changes or backend manipulation.

## What I Would Build Next (2-3 Hours)

**Offline support** would let officers continue logging in parking garages with poor connectivity. Service workers plus IndexedDB for queuing, with background sync when connection returns.

**Optimistic updates** would make activity logging feel instant. Currently, logging an activity requires waiting for the API response before the UI updates.

**Bulk actions** for common workflows: "Mark zone as reviewed" to dismiss all current overstays after walking through, or "Issue warnings to all overstays" for efficient enforcement.

**Search** by license plate for officers responding to complaints rather than doing routine patrol.
