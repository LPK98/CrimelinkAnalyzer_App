import { api } from "@/src/api/api";
import { deletePendingLocations, getPendingLocations } from "./locationDB";

export async function removePendingLocations() {
  const rows = getPendingLocations();
  if (rows.length === 0) return;

  const payload = rows.map((row: any) => ({
    ts: row.ts,
    latitude: row.latitude,
    longitude: row.longitude,
    accuracyM: row.accuracyM,
    speedMps: row.speedMps,
    headingDeg: row.headingDeg,
    provider: row.provider,
    meta: row.meta ? JSON.parse(row.meta) : undefined,
  }));

  console.log("[LOCATION] Uploading before batch:", payload.length); //REMOVE: for testing
  try {
    await api.post("/api/officers/me/locations/bulk", payload);
    deletePendingLocations(rows.map((row: any) => row.id));
  } catch (error) {
    console.log("[LOCATION] Upload failed:", error); //REMOVE: for testing
    throw error;
  } finally {
    console.log("[LOCATION] Uploading after batch:", payload.length); //REMOVE: for testing
  }
}
