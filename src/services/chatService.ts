import { api } from "../api/api";
import type { ChatMessage, SendMessageRequest } from "../types/chat";

/**
 * Send a chat message via the backend REST API.
 */
export const sendMessage = async (
  request: SendMessageRequest,
): Promise<ChatMessage> => {
  const res = await api.post("/api/chat/send", request);
  return res.data;
};

/**
 * Fetch the most recent 50 messages (chronological order).
 */
export const getRecentMessages = async (): Promise<ChatMessage[]> => {
  const res = await api.get("/api/chat/recent");
  return res.data;
};

/**
 * Fetch messages created after the given ISO timestamp (for polling).
 */
export const getMessagesSince = async (
  after: string,
): Promise<ChatMessage[]> => {
  const res = await api.get(`/api/chat/since?after=${encodeURIComponent(after)}`);
  return res.data;
};
