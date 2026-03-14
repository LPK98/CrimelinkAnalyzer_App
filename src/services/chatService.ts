import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { api } from "../api/api";

export type ChatMessageType = "text" | "image" | "audio";

export type ChatMessage = {
  id: string;
  type: ChatMessageType;
  text: string | null;
  mediaUrl: string | null;
  senderId: string;
  senderEmail: string;
  recipientId: string;
  recipientEmail: string;
  conversationId: string;
  timestamp: unknown;
};

type RawChatMessage = {
  type?: ChatMessageType;
  text?: string | null;
  mediaUrl?: string | null;
  senderId?: string;
  senderEmail?: string;
  recipientId?: string;
  recipientEmail?: string;
  conversationId?: string;
  timestamp?: unknown;
};

export type SendChatMessageInput = {
  senderId: string;
  senderEmail: string;
  recipientId: string;
  recipientEmail: string;
  type: ChatMessageType;
  text: string | null;
  mediaUrl: string | null;
};

type SubscribeToConversationParams = {
  appUserId: string;
  recipientId: string;
  onMessages: (messages: ChatMessage[]) => void;
  onError?: (error: unknown) => void;
};

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

type EndpointFailure = {
  endpoint: (typeof CANDIDATE_USER_ENDPOINTS)[number];
  reason: unknown;
};

export const buildConversationId = (userA: string, userB: string): string => {
  return [userA, userB].sort().join("_");
};

const ID_SOURCE_PRIORITY: Record<"userId" | "id" | "officerId", number> = {
  userId: 3,
  id: 2,
  officerId: 1,
};

const MAX_ACTIVITY_DOCS = 300;
const ACTIVITY_RETRY_ATTEMPTS = 1;

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

const isParticipantPair = (
  senderId: string,
  recipientId: string,
  currentUserId: string,
  targetUserId: string,
): boolean => {
  return (
    (senderId === currentUserId && recipientId === targetUserId) ||
    (senderId === targetUserId && recipientId === currentUserId)
  );
};

const parseMessageDoc = (
  doc: QueryDocumentSnapshot,
  appUserId: string,
  recipientId: string,
): ChatMessage | null => {
  const data = doc.data() as RawChatMessage;
  const senderId = data.senderId ? String(data.senderId) : "";
  const targetRecipientId = data.recipientId ? String(data.recipientId) : "";
  const conversationId =
    typeof data.conversationId === "string" ? data.conversationId : "";

  if (!conversationId) {
    return null;
  }

  if (!isParticipantPair(senderId, targetRecipientId, appUserId, recipientId)) {
    return null;
  }

  return {
    id: doc.id,
    type: data.type ?? "text",
    text: data.text ?? null,
    mediaUrl: data.mediaUrl ?? null,
    senderId,
    senderEmail: data.senderEmail ?? "",
    recipientId: targetRecipientId,
    recipientEmail: data.recipientEmail ?? "",
    conversationId,
    timestamp: data.timestamp ?? null,
  };
};

export const subscribeToConversationMessages = ({
  appUserId,
  recipientId,
  onMessages,
  onError,
}: SubscribeToConversationParams): Unsubscribe => {
  const conversationId = buildConversationId(appUserId, recipientId);
  const messagesRef = collection(db, "messages");

  const messagesQuery = query(
    messagesRef,
    where("conversationId", "==", conversationId),
    orderBy("timestamp", "asc"),
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs
        .map((doc) => parseMessageDoc(doc, appUserId, recipientId))
        .filter((message): message is ChatMessage => message !== null);

      onMessages(messages);
    },
    (error) => {
      if (onError) {
        onError(error);
        return;
      }

      console.error("Error listening to conversation messages:", error);
    },
  );
};

export const sendChatMessage = async ({
  senderId,
  senderEmail,
  recipientId,
  recipientEmail,
  type,
  text,
  mediaUrl,
}: SendChatMessageInput): Promise<void> => {
  const conversationId = buildConversationId(senderId, recipientId);

  await addDoc(collection(db, "messages"), {
    type,
    text,
    mediaUrl,
    senderId,
    senderEmail,
    recipientId,
    recipientEmail,
    conversationId,
    timestamp: serverTimestamp(),
  });
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

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const getErrorSummary = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

const getEndpointErrorSummary = (
  endpoint: (typeof CANDIDATE_USER_ENDPOINTS)[number],
  error: unknown,
): string => {
  return `${endpoint}: ${getErrorSummary(error)}`;
};

const getDocsWithRetry = async (
  sourceQuery: ReturnType<typeof query>,
): Promise<Awaited<ReturnType<typeof getDocs>>> => {
  let attempts = 0;
  let lastError: unknown = null;

  while (attempts <= ACTIVITY_RETRY_ATTEMPTS) {
    try {
      return await getDocs(sourceQuery);
    } catch (error) {
      lastError = error;
      attempts += 1;

      if (attempts <= ACTIVITY_RETRY_ATTEMPTS) {
        await wait(150 * attempts);
      }
    }
  }

  throw lastError;
};

const fetchLastActivityByCounterpart = async (
  currentUserId: string,
): Promise<ActivityByCounterpart> => {
  const messagesRef = collection(db, "messages");

  const sentQuery = query(
    messagesRef,
    where("senderId", "==", currentUserId),
    orderBy("timestamp", "desc"),
    limit(MAX_ACTIVITY_DOCS),
  );

  const receivedQuery = query(
    messagesRef,
    where("recipientId", "==", currentUserId),
    orderBy("timestamp", "desc"),
    limit(MAX_ACTIVITY_DOCS),
  );

  const [sentResult, receivedResult] = await Promise.allSettled([
    getDocsWithRetry(sentQuery),
    getDocsWithRetry(receivedQuery),
  ]);

  if (
    sentResult.status === "rejected" &&
    receivedResult.status === "rejected"
  ) {
    throw new Error(
      `Unable to load chat activity. Sent query failed: ${getErrorSummary(sentResult.reason)}. Received query failed: ${getErrorSummary(receivedResult.reason)}.`,
    );
  }

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

  if (sentResult.status === "fulfilled") {
    sentResult.value.docs.forEach((doc) => {
      const data = doc.data() as MessageDoc;
      upsertFromDoc(data);
    });
  }

  if (receivedResult.status === "fulfilled") {
    receivedResult.value.docs.forEach((doc) => {
      const data = doc.data() as MessageDoc;
      upsertFromDoc(data);
    });
  }

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

    const incomingWins =
      ID_SOURCE_PRIORITY[incomingSource] > ID_SOURCE_PRIORITY[existingSource];
    const preferred = incomingWins ? user : existing;
    const secondary = incomingWins ? existing : user;

    byId.set(user.id, {
      ...preferred,
      name: preferred.name || secondary.name,
      email: preferred.email || secondary.email,
      status: preferred.status ?? secondary.status,
      lastMessageAt: preferred.lastMessageAt ?? secondary.lastMessageAt ?? null,
      lastMessagePreview:
        preferred.lastMessagePreview ?? secondary.lastMessagePreview ?? null,
      lastMessageType:
        preferred.lastMessageType ?? secondary.lastMessageType ?? null,
      idSource: preferred.idSource ?? secondary.idSource,
    });
  });

  return Array.from(byId.values());
};

export async function fetchChatUsers(
  currentUserId?: string,
): Promise<ChatUser[]> {
  const failures: EndpointFailure[] = [];
  let bestUsers: ChatUser[] | null = null;

  const endpointResults = await Promise.allSettled(
    CANDIDATE_USER_ENDPOINTS.map(async (endpoint) => {
      const { data } = await api.get(endpoint);
      return { endpoint, data };
    }),
  );

  endpointResults.forEach((result, index) => {
    const endpoint = CANDIDATE_USER_ENDPOINTS[index];

    if (result.status === "rejected") {
      failures.push({ endpoint, reason: result.reason });
      return;
    }

    const list = extractList(result.value.data);
    if (!list) {
      return;
    }

    const users = dedupeUsers(
      list
        .map(normalizeUser)
        .filter((user): user is ChatUser => user !== null)
        .filter((user) => (currentUserId ? user.id !== currentUserId : true)),
    );

    bestUsers = chooseBetterUsers(bestUsers, users);
  });

  const resolvedUsers = bestUsers ?? [];

  if (resolvedUsers.length > 0) {
    const dedupedBestUsers = dedupeUsers(resolvedUsers);

    if (!currentUserId) {
      return dedupedBestUsers;
    }

    try {
      const activity = await fetchLastActivityByCounterpart(currentUserId);

      return dedupedBestUsers.map((chatUser) => {
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
      return dedupedBestUsers.map((chatUser) => ({
        ...chatUser,
        lastMessageAt: null,
        lastMessagePreview: null,
        lastMessageType: null,
      }));
    }
  }

  if (failures.length > 0) {
    const details = failures
      .map((failure) =>
        getEndpointErrorSummary(failure.endpoint, failure.reason),
      )
      .join(" | ");
    throw new Error(`Failed to load chat users from backend. ${details}`);
  }

  return [];
}
