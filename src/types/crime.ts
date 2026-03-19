export const crimeType = {
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

export type crimeType = (typeof crimeType)[keyof typeof crimeType];
