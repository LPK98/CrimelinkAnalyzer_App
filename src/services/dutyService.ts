import { api } from "../api/api";
import type { DutyAssignment, DutyDetail } from "../types/duty";

export const getOfficerDuties = async (
  officerId: string,
): Promise<DutyAssignment[]> => {
  const res = await api.get(`/api/duties/officer/${officerId}`);
  return res.data;
};

export const getOfficerDutiesByDate = async (
  officerId: string,
  date: string,
): Promise<DutyDetail[]> => {
  const res = await api.get(`/api/duties/officer/${officerId}/date`, {
    params: { date },
  });
  return res.data;
};
