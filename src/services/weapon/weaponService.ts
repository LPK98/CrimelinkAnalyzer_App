import { api } from "@/src/api/api";
import { WeaponRequestType, weaponType } from "@/src/types/weaponTypes";

const normalizeWeapon = (raw: any): weaponType => {
  const imageUrl = raw?.imageUrl ?? raw?.image_url ?? raw?.photoUrl ?? undefined;

  return {
    serialNumber: raw?.serialNumber ?? raw?.serial_number,
    weaponType: raw?.weaponType ?? raw?.weapon_type,
    status: raw?.status,
    updatedDate: raw?.updatedDate ?? raw?.updated_date,
    registerDate: raw?.registerDate ?? raw?.register_date,
    imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
  };
};

export const getAllWeapons = async () => {
  try {
    const res = await api.get("/api/weapon/all");
    const data = Array.isArray(res.data) ? res.data : [];
    return data.map(normalizeWeapon);
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
