export type ChatMessageType = "text" | "image" | "audio";

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  messageType: ChatMessageType;
  content: string | null;
  mediaUrl: string | null;
  createdAt: string; // ISO 8601 from backend
}

export interface SendMessageRequest {
  senderId: number;
  messageType: ChatMessageType;
  content?: string;
  mediaUrl?: string;
}
