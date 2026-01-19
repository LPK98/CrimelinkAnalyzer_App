// src/types/duty.ts

export type DutyAssignment = {
  id: number;
  officerId: string;
  officerName: string;
  date: string; // YYYY-MM-DD
  location: string;
  timeRange: string;
  status: "ACTIVE" | "COMPLETED" | "ABSENT" | "PENDING";
  taskType: string;
  description?: string;
  duration?: number;
};

export type DutyDetail = {
  id: number;
  taskType: string;
  location: string;
  timeRange: string;
  status: string;
  description?: string;
};
