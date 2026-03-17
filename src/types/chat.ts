import type { Timestamp } from "firebase/firestore";

export type ChatMessageType = "text" | "image" | "audio";

export type UploadedPhotoPayload = {
  mediaUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  width?: number;
  height?: number;
  mimeType?: string | null;
  source: "camera" | "gallery";
};

export type ChatMessage = {
  id: string;
  type: ChatMessageType;
  text: string | null;
  mediaUrl: string | null;
  senderId: string;
  senderEmail: string;
  photoUrl?: string | null;
  imageName?: string | null;
  imageSize?: number | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  imageMimeType?: string | null;
  imageSource?: "camera" | "gallery" | null;
  timestamp?: Timestamp | Date | null;
};

export type NewChatMessage = {
  type: ChatMessageType;
  text: string | null;
  mediaUrl: string | null;
  senderId: string;
  senderEmail: string;
  photoUrl?: string | null;
  imageName?: string | null;
  imageSize?: number | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  imageMimeType?: string | null;
  imageSource?: "camera" | "gallery" | null;
};
