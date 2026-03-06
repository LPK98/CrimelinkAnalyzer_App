import { api } from "@/src/api/api";

export const getAllWeapons = async () => {
  try {
    const res = await api.get("/api/weapon/all");
    return res.data;
  } catch (error) {
    console.error("Error fetching weapons:", error);
    throw error;
  }
};
