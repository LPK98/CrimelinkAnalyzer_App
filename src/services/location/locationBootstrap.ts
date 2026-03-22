import { isDutyTrackingEnabled } from "@/src/auth/auth";
import { initLocationDB } from "@/src/services/location/locationDB";
import {
  isTrackingActive,
  startTracking,
  stopTracking,
} from "@/src/services/location/locationTracker";

let hasBootstrappedLocationTracking = false;

export async function bootstrapLocationTracking() {
  if (hasBootstrappedLocationTracking) return;

  hasBootstrappedLocationTracking = true;

  initLocationDB();

  const dutyTrackingEnabled = await isDutyTrackingEnabled();
  const trackingActive = await isTrackingActive();

  if (dutyTrackingEnabled && !trackingActive) {
    try {
      await startTracking();
    } catch (error) {
      // Startup should not crash if permissions are missing; user can re-enable from Duty toggle.
      console.warn("[LOCATION] Failed to resume tracking on app start:", error);
    }
    return;
  }

  if (!dutyTrackingEnabled && trackingActive) {
    await stopTracking();
  }
}
