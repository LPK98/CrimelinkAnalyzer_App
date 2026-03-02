import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("crimelink.db");

export function initLocationDB() {
  db.execSync(`CREATE TABLE IF NOT EXISTS pending_locations (
      id TEXT PRIMARY KEY,
      ts TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracyM REAL,
      speedMps REAL,
      headingDeg REAL,
      provider TEXT,
      meta TEXT
    );`);
}

export function addPendingLocation(row: {
  id: string;
  ts: string;
  latitude: number;
  longitude: number;
  accuracyM?: number | null;
  speedMps?: number | null;
  headingDeg?: number | null;
  provider?: string | null;
  meta?: string | null;
}) {
  db.runSync(
    `INSERT OR IGNORE INTO pending_locations
     (id, ts, latitude, longitude, accuracyM, speedMps, headingDeg, provider, meta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.ts,
      row.latitude,
      row.longitude,
      row.accuracyM ?? null,
      row.speedMps ?? null,
      row.headingDeg ?? null,
      row.provider ?? null,
      row.meta ?? null,
    ],
  );
}

export function getPendingLocations(limit = 200) {
  return db.getAllSync<any>(
    `SELECT * FROM pending_locations ORDER BY ts ASC LIMIT ?`,
    [limit],
  );
}

export function deletePendingLocations(ids: string[]) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(",");
  db.runSync(
    `DELETE FROM pending_locations WHERE id IN (${placeholders})`,
    ids,
  );
}

export function countPendingLocations(): number { //REMOVE: for testing
  const row = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM pending_locations"
  );
  return row?.count ?? 0;
}