import { api } from "@/src/api/api";
import { WeaponRequestType } from "@/src/types/weaponTypes";

export const getAllWeapons = async () => {
  try {
    const res = await api.get("/api/weapon/all");
    return res.data;
  } catch (error) {
    console.error("Error fetching weapons:", error);
    throw error;
  }
};

export const getWeaponByOfficer = async (userId: number) => {
  try {
    const res = await api.get(`/api/weapon/issued/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user's weapons:", error);
    throw error;
  }
};

export const submitWeaponRequest = async (
  weaponRequestData: WeaponRequestType,
) => {
  try {
    const res = await api.post("/api/weapon/requests", weaponRequestData);
    return res.data;
  } catch (error) {
    console.error("Error submitting weapon request:", error);
    throw error;
  }
};

export const getWeaponRequestsByOfficer = async (userId: number) => {
  try {
    const res = await api.get(`/api/weapon/requests/user/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user's weapon requests:", error);
    throw error;
  }
};
