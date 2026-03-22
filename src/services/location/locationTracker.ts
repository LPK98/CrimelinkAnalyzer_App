import * as Crypto from "expo-crypto";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import { addPendingLocation, countPendingLocations } from "./locationDB";
import { removePendingLocations } from "./locationUploader";
const TASK_NAME = "CRIMELINK_LOCATION_TASK";

export const LOCATION_TRACKING_ERROR_CODE = {
  FOREGROUND_PERMISSION_DENIED: "FOREGROUND_LOCATION_PERMISSION_DENIED",
  BACKGROUND_PERMISSION_DENIED: "BACKGROUND_LOCATION_PERMISSION_DENIED",
  BACKGROUND_LOCATION_UNAVAILABLE: "BACKGROUND_LOCATION_UNAVAILABLE",
  IOS_BACKGROUND_PERMISSION_ESCALATION_REQUIRED:
    "IOS_BACKGROUND_PERMISSION_ESCALATION_REQUIRED",
} as const;

function createLocationPermissionError(code: string, message: string) {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}

if (!TaskManager.isTaskDefined(TASK_NAME)) {
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
}

export function getTrackingTaskName() {
  return TASK_NAME;
}

export async function isTrackingActive() {
  return Location.hasStartedLocationUpdatesAsync(TASK_NAME);
}

export async function startTracking() {
  const isBackgroundLocationAvailable =
    await Location.isBackgroundLocationAvailableAsync();

  if (!isBackgroundLocationAvailable) {
    throw createLocationPermissionError(
      LOCATION_TRACKING_ERROR_CODE.BACKGROUND_LOCATION_UNAVAILABLE,
      "Background location is not available in this build",
    );
  }

  const foregroundPermission = await Location.getForegroundPermissionsAsync();

  let foregroundStatus = foregroundPermission.status;
  if (foregroundStatus !== "granted") {
    const requestedForegroundPermission =
      await Location.requestForegroundPermissionsAsync();
    foregroundStatus = requestedForegroundPermission.status;
  }

  if (foregroundStatus !== "granted") {
    throw createLocationPermissionError(
      LOCATION_TRACKING_ERROR_CODE.FOREGROUND_PERMISSION_DENIED,
      "Foreground location permission denied",
    );
  }

  const backgroundPermission = await Location.getBackgroundPermissionsAsync();

  let backgroundStatus = backgroundPermission.status;
  if (backgroundStatus !== "granted") {
    const requestedBackgroundPermission =
      await Location.requestBackgroundPermissionsAsync();
    backgroundStatus = requestedBackgroundPermission.status;
  }

  if (backgroundStatus !== "granted") {
    if (Platform.OS === "ios") {
      throw createLocationPermissionError(
        LOCATION_TRACKING_ERROR_CODE.IOS_BACKGROUND_PERMISSION_ESCALATION_REQUIRED,
        "iOS background permission escalation required",
      );
    }

    throw createLocationPermissionError(
      LOCATION_TRACKING_ERROR_CODE.BACKGROUND_PERMISSION_DENIED,
      "Background location permission denied",
    );
  }

  const hasStarted = await isTrackingActive();
  console.log("[LOCATION] Already started:", hasStarted); //REMOVE: for testing
  if (hasStarted) return;

  await Location.startLocationUpdatesAsync(TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 15 * 1000,
    distanceInterval: 15,
    showsBackgroundLocationIndicator: true,
    pausesUpdatesAutomatically: false,
    ...(Platform.OS === "android"
      ? {
          foregroundService: {
            notificationTitle: "Duty tracking active",
            notificationBody:
              "Crime Link Analyzer is collecting location while you are on duty.",
            notificationColor: "#0B57D0",
          },
        }
      : {}),
  });
}

export async function stopTracking() {
  const hasStarted = await isTrackingActive();
  if (!hasStarted) return;

  await Location.stopLocationUpdatesAsync(TASK_NAME);
}
