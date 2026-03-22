import { CRIME_COLORS } from "../constants/crimeTypeColors";
import { crimeType } from "../types/SafetyzoneTypes";

export const getCrimeColor = (crimeType: crimeType): string => {
  return CRIME_COLORS[crimeType];
};
