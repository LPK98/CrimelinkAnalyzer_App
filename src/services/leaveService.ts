import { api } from "../api/api";
import type { LeaveRequest, LeaveSubmitRequest } from "../types/leave";

export const getOfficerLeaves = async (
  officerId: string,
): Promise<LeaveRequest[]> => {
  const res = await api.get(`/api/leaves/officer/${officerId}`);
  return res.data;
};

export const submitLeaveRequest = async (
  request: LeaveSubmitRequest,
): Promise<LeaveRequest> => {
  const res = await api.post(`/api/leaves/request`, request);
  return res.data;
};
