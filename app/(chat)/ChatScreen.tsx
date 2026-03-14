import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from "react-native";

import { db } from "../../firebaseConfig";
import ChatInput from "../../src/components/chat/ChatInput";
import MessageBubble from "../../src/components/chat/MessageBubble";
import { useAuth } from "../../src/hooks/useAuth";

type ChatMessageType = "text" | "image" | "audio";

type ChatMessage = {
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

const buildConversationId = (userA: string, userB: string): string => {
  return [userA, userB].sort().join("_");
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong.";
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const flatListRef = useRef<FlatList<ChatMessage> | null>(null);
  const { user, logout } = useAuth();
  const params = useLocalSearchParams<{
    recipientId?: string;
    recipientName?: string;
    recipientEmail?: string;
  }>();

  const appUserId = user?.id != null ? String(user.id) : null;
  const appUserEmail = user?.username ?? "Unknown User";
  const recipientId =
    typeof params.recipientId === "string" ? params.recipientId : null;
  const recipientName =
    typeof params.recipientName === "string"
      ? params.recipientName
      : "Conversation";
  const recipientEmail =
    typeof params.recipientEmail === "string" ? params.recipientEmail : "";
  const conversationId =
    appUserId && recipientId
      ? buildConversationId(appUserId, recipientId)
      : null;

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "asc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messageList: ChatMessage[] = snapshot.docs.flatMap((doc) => {
          const data = doc.data() as Partial<ChatMessage>;
          const senderId = data.senderId ?? "";
          const targetRecipientId = data.recipientId ?? "";
          const docConversationId = data.conversationId ?? "";

          if (!docConversationId) {
            return [];
          }

          const message: ChatMessage = {
            id: doc.id,
            type: data.type ?? "text",
            text: data.text ?? null,
            mediaUrl: data.mediaUrl ?? null,
            senderId,
            senderEmail: data.senderEmail ?? "",
            recipientId: targetRecipientId,
            recipientEmail: data.recipientEmail ?? "",
            conversationId: docConversationId,
            timestamp: data.timestamp ?? null,
          };

          return [message];
        });

        setMessages(messageList);
      },
      (error) => {
        console.error("Error listening to messages:", error);
      },
    );

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async (
    type: ChatMessageType,
    payload: { text: string | null; mediaUrl: string | null },
  ) => {
    if (!appUserId) {
      Alert.alert("Error", "You must be logged in to send messages.");
      return;
    }

    if (!recipientId || !conversationId) {
      Alert.alert("Error", "No recipient selected for this conversation.");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        type,
        text: payload.text,
        mediaUrl: payload.mediaUrl,
        senderId: appUserId,
        senderEmail: appUserEmail,
        recipientId,
        recipientEmail,
        conversationId,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error sending ${type} message:`, error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const handleSendText = async (text: string) => {
    await sendMessage("text", { text, mediaUrl: null });
  };

  const handleSendImage = async (mediaUrl: string) => {
    await sendMessage("image", { text: null, mediaUrl });
  };

  const handleSendAudio = async (mediaUrl: string) => {
    await sendMessage("audio", { text: null, mediaUrl });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert("Error", getErrorMessage(error));
          }
        },
      },
    ]);
  };

  const renderMessage: ListRenderItem<ChatMessage> = ({ item }) => {
    return (
      <MessageBubble
        text={item.text}
        type={item.type}
        mediaUrl={item.mediaUrl}
        senderEmail={item.senderEmail}
        isCurrentUser={item.senderId === appUserId}
        timestamp={item.timestamp}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(chat)/Inbox")}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{recipientName}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet.</Text>
              <Text style={styles.emptySubtext}>
                Start a secure conversation with {recipientName}.
              </Text>
            </View>
          }
        />

        <ChatInput
          onSendText={handleSendText}
          onSendImage={handleSendImage}
          onSendAudio={handleSendAudio}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F1F",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingBottom: 12,
    backgroundColor: "#10162A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(91, 124, 255, 0.2)",
  },
  backText: {
    color: "#5B7CFF",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E9ECF8",
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(91, 124, 255, 0.2)",
  },
  logoutText: {
    color: "#5B7CFF",
    fontSize: 14,
    fontWeight: "600",
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "#A5B0D8",
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#7783B5",
    marginTop: 8,
  },
});

export default ChatScreen;
