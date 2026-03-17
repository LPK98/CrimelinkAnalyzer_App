import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/firebase";
import type { ChatMessage, NewChatMessage } from "@/src/types/chat";

const MESSAGES_COLLECTION = "messages";

export const subscribeToMessages = (
  onMessages: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  const messageQuery = query(
    collection(db, MESSAGES_COLLECTION),
    orderBy("timestamp", "asc"),
  );

  return onSnapshot(
    messageQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<ChatMessage, "id">;
        return {
          id: doc.id,
          ...data,
        };
      });

      onMessages(messages);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    },
  );
};

export const sendMessage = async (message: NewChatMessage): Promise<void> => {
  await addDoc(collection(db, MESSAGES_COLLECTION), {
    ...message,
    timestamp: serverTimestamp(),
  });
};
