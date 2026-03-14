import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { api } from "../api/api";

export type ChatUser = {
  id: string;
  name: string;
  email: string;
  status?: string;
  lastMessageAt?: number | null;
  lastMessagePreview?: string | null;
  lastMessageType?: "text" | "image" | "audio" | null;
  idSource?: "userId" | "id" | "officerId";
};

const CANDIDATE_USER_ENDPOINTS = [
  "/api/users/field-officers",
  "/api/users/all-officers",
] as const;

type AnyRecord = Record<string, unknown>;

type MessageDoc = {
  senderId?: string;
  recipientId?: string;
  type?: "text" | "image" | "audio";
  text?: string | null;
  timestamp?: unknown;
};

type ActivityByCounterpart = Record<
  string,
  {
    lastMessageAt: number;
    lastMessagePreview: string | null;
    lastMessageType: "text" | "image" | "audio" | null;
  }
>;

const ID_SOURCE_PRIORITY: Record<"userId" | "id" | "officerId", number> = {
  userId: 3,
  id: 2,
  officerId: 1,
};

const getString = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number") return String(value);
  return null;
};

const getTimestampMillis = (value: unknown): number | null => {
  if (!value) return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "object") {
    const candidate = value as {
      toMillis?: () => number;
      seconds?: number;
      nanoseconds?: number;
    };

    if (typeof candidate.toMillis === "function") {
      const millis = candidate.toMillis();
      return Number.isFinite(millis) ? millis : null;
    }

    if (typeof candidate.seconds === "number") {
      const nanos =
        typeof candidate.nanoseconds === "number" ? candidate.nanoseconds : 0;
      return Math.floor(candidate.seconds * 1000 + nanos / 1_000_000);
    }
  }

  return null;
};

const getMessagePreview = (
  type: "text" | "image" | "audio" | undefined,
  text: string | null | undefined,
): string | null => {
  if (type === "text") {
    const trimmed = text?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : "Message";
  }
  if (type === "image") return "Photo";
  if (type === "audio") return "Voice message";
  return "Message";
};

const normalizeUser = (raw: unknown): ChatUser | null => {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as AnyRecord;

  const userId = getString(item.userId);
  const idField = getString(item.id);
  const officerId = getString(item.officerId);

  const id = userId ?? idField ?? officerId;
  const idSource = userId
    ? "userId"
    : idField
      ? "id"
      : officerId
        ? "officerId"
        : null;
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
    idSource: idSource ?? undefined,
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

const mergeByCounterpart = (
  activity: ActivityByCounterpart,
  counterpartId: string,
  timestamp: number,
  preview: string | null,
  type: "text" | "image" | "audio" | null,
) => {
  const existing = activity[counterpartId];
  if (!existing || timestamp > existing.lastMessageAt) {
    activity[counterpartId] = {
      lastMessageAt: timestamp,
      lastMessagePreview: preview,
      lastMessageType: type,
    };
  }
};

const fetchLastActivityByCounterpart = async (
  currentUserId: string,
): Promise<ActivityByCounterpart> => {
  const messagesRef = collection(db, "messages");

  const sentQuery = query(
    messagesRef,
    where("senderId", "==", currentUserId),
    orderBy("timestamp", "desc"),
    limit(150),
  );

  const receivedQuery = query(
    messagesRef,
    where("recipientId", "==", currentUserId),
    orderBy("timestamp", "desc"),
    limit(150),
  );

  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    getDocs(sentQuery),
    getDocs(receivedQuery),
  ]);

  const activity: ActivityByCounterpart = {};

  const upsertFromDoc = (docData: MessageDoc) => {
    const senderId = getString(docData.senderId);
    const recipientId = getString(docData.recipientId);

    if (!senderId || !recipientId) return;

    const idToUse =
      senderId === currentUserId
        ? recipientId
        : recipientId === currentUserId
          ? senderId
          : null;
    if (!idToUse || idToUse === currentUserId) return;

    const timestamp = getTimestampMillis(docData.timestamp);
    if (!timestamp) return;

    const type = docData.type ?? null;
    const preview = getMessagePreview(docData.type, docData.text ?? null);
    mergeByCounterpart(activity, idToUse, timestamp, preview, type);
  };

  sentSnapshot.docs.forEach((doc) => {
    const data = doc.data() as MessageDoc;
    upsertFromDoc(data);
  });

  receivedSnapshot.docs.forEach((doc) => {
    const data = doc.data() as MessageDoc;
    upsertFromDoc(data);
  });

  return activity;
};

const chooseBetterUsers = (
  current: ChatUser[] | null,
  candidate: ChatUser[],
): ChatUser[] => {
  if (!current || current.length === 0) {
    return candidate;
  }

  const score = (users: ChatUser[]) => {
    return users.reduce((total, user) => {
      const source = user.idSource ?? "officerId";
      return total + ID_SOURCE_PRIORITY[source];
    }, 0);
  };

  const currentScore = score(current);
  const candidateScore = score(candidate);

  if (candidateScore > currentScore) {
    return candidate;
  }

  if (candidateScore === currentScore && candidate.length > current.length) {
    return candidate;
  }

  return current;
};

const dedupeUsers = (users: ChatUser[]): ChatUser[] => {
  const byId = new Map<string, ChatUser>();

  users.forEach((user) => {
    const existing = byId.get(user.id);
    if (!existing) {
      byId.set(user.id, user);
      return;
    }

    const existingSource = existing.idSource ?? "officerId";
    const incomingSource = user.idSource ?? "officerId";

    if (
      ID_SOURCE_PRIORITY[incomingSource] > ID_SOURCE_PRIORITY[existingSource]
    ) {
      byId.set(user.id, user);
      return;
    }

    if (!existing.email && user.email) {
      byId.set(user.id, { ...existing, email: user.email });
    }
  });

  return Array.from(byId.values());
};

export async function fetchChatUsers(
  currentUserId?: string,
): Promise<ChatUser[]> {
  let lastError: unknown = null;
  let bestUsers: ChatUser[] | null = null;

  for (const endpoint of CANDIDATE_USER_ENDPOINTS) {
    try {
      const { data } = await api.get(endpoint);
      const list = extractList(data);
      if (!list) continue;

      const users = dedupeUsers(
        list
          .map(normalizeUser)
          .filter((user): user is ChatUser => user !== null)
          .filter((user) => (currentUserId ? user.id !== currentUserId : true)),
      );

      bestUsers = chooseBetterUsers(bestUsers, users);
    } catch (error: unknown) {
      lastError = error;
    }
  }

  if (bestUsers && bestUsers.length > 0) {
    if (!currentUserId) {
      return bestUsers;
    }

    try {
      const activity = await fetchLastActivityByCounterpart(currentUserId);

      return bestUsers.map((chatUser) => {
        const last = activity[chatUser.id];
        if (!last) {
          return {
            ...chatUser,
            lastMessageAt: null,
            lastMessagePreview: null,
            lastMessageType: null,
          };
        }

        return {
          ...chatUser,
          lastMessageAt: last.lastMessageAt,
          lastMessagePreview: last.lastMessagePreview,
          lastMessageType: last.lastMessageType,
        };
      });
    } catch (error) {
      console.warn("Unable to load chat activity metadata:", error);
      return bestUsers.map((chatUser) => ({
        ...chatUser,
        lastMessageAt: null,
        lastMessagePreview: null,
        lastMessageType: null,
      }));
    }
  }

  if (lastError) {
    throw new Error("Failed to load chat users from backend.");
  }

  return [];
}
