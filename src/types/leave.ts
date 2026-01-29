export type LeaveStatus = "Pending" | "Approved" | "Denied";

export interface LeaveRequest {
  id: string;
  officerId: string;
  officerName: string;
  date: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  requestedDate: string; // YYYY-MM-DD
  responseReason?: string;
  respondedBy?: string;
  respondedDate?: string;
}

export interface LeaveSubmitRequest {
  officerId: string;
  date: string;
  reason: string;
}

export interface LeaveUpdateRequest {
  status: LeaveStatus;
  responseReason?: string;
}
