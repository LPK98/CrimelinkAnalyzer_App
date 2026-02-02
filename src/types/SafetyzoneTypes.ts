export const CRIME_TYPES = {
  THEFT: "THEFT",
  ASSAULT: "ASSAULT",
  BURGLARY: "BURGLARY",
  ROBBERY: "ROBBERY",
  VANDALISM: "VANDALISM",
  DRUG_OFFENSE: "DRUG_OFFENSE",
  TRAFFIC_VIOLATION: "TRAFFIC_VIOLATION",
  HOMICIDE: "HOMICIDE",
  FRAUD: "FRAUD",
  ARSON: "ARSON",
} as const;

export type crimeType = (typeof CRIME_TYPES)[keyof typeof CRIME_TYPES];

export type CrimeLocationType = {
  latitude: number;
  longitude: number;
  crimeType: crimeType;
};
