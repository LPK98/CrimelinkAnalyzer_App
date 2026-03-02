import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import * as Crypto from "expo-crypto";
import { addPendingLocation, countPendingLocations } from "./locationDB";
import { removePendingLocations } from "./locationUploader";
const TASK_NAME = "CRIMELINK_LOCATION_TASK";

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  console.log("[LOCATION] Background task triggered"); //REMOVE: for testing
  if (error) {
    console.error("[LOCATION] Task error", error); //REMOVE: for testing
    return;
  }

  const location = (data as any)?.locations?.[0];
  if (!location) return;

  const { latitude, longitude, accuracy, speed, heading } = location.coords;

  if (accuracy != null && accuracy > 50) return;

  addPendingLocation({
    id: Crypto.randomUUID(),
    ts: new Date(location.timestamp).toISOString(),
    latitude,
    longitude,
    accuracyM: accuracy ?? null,
    speedMps: speed ?? null,
    headingDeg: heading ?? null,
    provider: "gps",
    meta: JSON.stringify({ battery: null }),
  });

  try {
    await removePendingLocations();
  } catch {}
  const count = countPendingLocations(); //REMOVE:for testing
  console.log("[LOCATION] Pending rows in SQLite:", count);
});

export async function startTracking() {
  const foregroundPermission =
    await Location.requestForegroundPermissionsAsync();
  if (foregroundPermission.status !== "granted")
    throw new Error("Foreground location permission denied");

  const backgroundPermission =
    await Location.requestBackgroundPermissionsAsync();
  if (backgroundPermission.status !== "granted")
    throw new Error("Background location permission denied");

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
  console.log("[LOCATION] Already started:", hasStarted); //REMOVE: for testing
  if (hasStarted) return;

  await Location.startLocationUpdatesAsync(TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 15 * 1000,
    distanceInterval: 15,
    showsBackgroundLocationIndicator: true,
    pausesUpdatesAutomatically: false,
  });
}

export async function stopTracking() {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
  if (!hasStarted) return;

  await Location.stopLocationUpdatesAsync(TASK_NAME);
}
