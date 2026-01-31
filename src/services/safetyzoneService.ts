import { AxiosError } from "axios";
import { api } from "../api/api";
import { CrimeLocationType } from "../types/SafetyzoneTypes";

export async function getCrimeLocations(): Promise<CrimeLocationType[]> {
  try {
    const res = await api.get<CrimeLocationType[]>(
      "/api/crime-reports/map",
    );
    return res.data;
  } catch (error) {
    const err = error as AxiosError<any>;
    console.error("Error fetching crime locations:", {
      status: err.response?.status,
      data: err.response?.data,
      url: err.config?.url,
      method: err.config?.method,
      headersSent: err.config?.headers,
    });
    throw error;
  }
}
