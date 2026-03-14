import { api } from "../api/api";

export type ChatUser = {
  id: string;
  name: string;
  email: string;
  status?: string;
};

const CANDIDATE_USER_ENDPOINTS = [
  "/api/users/field-officers",
  "/api/users/all-officers",
] as const;

type AnyRecord = Record<string, unknown>;

const getString = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number") return String(value);
  return null;
};

const normalizeUser = (raw: unknown): ChatUser | null => {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as AnyRecord;

  const id =
    getString(item.userId) ?? getString(item.id) ?? getString(item.officerId);
  const email =
    getString(item.email) ??
    getString(item.username) ??
    getString(item.userName) ??
    "";
  const name =
    getString(item.name) ??
    getString(item.fullName) ??
    getString(item.displayName) ??
    email;

  if (!id || !name) return null;

  return {
    id,
    name,
    email,
    status: getString(item.status) ?? undefined,
  };
};

const extractList = (data: unknown): unknown[] | null => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return null;

  const container = data as AnyRecord;
  const keys = ["users", "officers", "data", "results", "items"] as const;

  for (const key of keys) {
    const value = container[key];
    if (Array.isArray(value)) return value;
  }

  return null;
};

export async function fetchChatUsers(
  currentUserId?: string,
): Promise<ChatUser[]> {
  let lastError: unknown = null;

  for (const endpoint of CANDIDATE_USER_ENDPOINTS) {
    try {
      const { data } = await api.get(endpoint);
      const list = extractList(data);
      if (!list) continue;

      const users = list
        .map(normalizeUser)
        .filter((user): user is ChatUser => user !== null)
        .filter((user) => (currentUserId ? user.id !== currentUserId : true));

      if (users.length > 0 || Array.isArray(list)) {
        return users;
      }
    } catch (error: unknown) {
      lastError = error;
    }
  }

  if (lastError) {
    throw new Error("Failed to load chat users from backend.");
  }

  return [];
}
