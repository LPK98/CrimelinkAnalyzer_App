import { Ionicons } from "@expo/vector-icons";
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
  NativeScrollEvent,
  NativeSyntheticEvent,
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

type FailedSendPayload = {
  type: ChatMessageType;
  payload: { text: string | null; mediaUrl: string | null };
};

const buildConversationId = (userA: string, userB: string): string => {
  return [userA, userB].sort().join("_");
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

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong.";
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [failedPayload, setFailedPayload] = useState<FailedSendPayload | null>(
    null,
  );
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
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
      setIsLoadingMessages(false);
      return;
    }

    setIsLoadingMessages(true);

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
          const senderId = data.senderId ? String(data.senderId) : "";
          const targetRecipientId = data.recipientId
            ? String(data.recipientId)
            : "";
          const docConversationId = data.conversationId ?? "";

          if (!docConversationId) {
            return [];
          }

          if (!appUserId || !recipientId) {
            return [];
          }

          if (
            !isParticipantPair(
              senderId,
              targetRecipientId,
              appUserId,
              recipientId,
            )
          ) {
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
        setIsLoadingMessages(false);
      },
      (error) => {
        console.error("Error listening to messages:", error);
        setIsLoadingMessages(false);
      },
    );

    return () => unsubscribe();
  }, [appUserId, conversationId, recipientId]);

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

    if (recipientId === appUserId) {
      Alert.alert("Error", "You cannot send a message to yourself.");
      return;
    }

    try {
      setIsSending(true);
      setSendError(null);
      setFailedPayload(null);

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
      const message =
        "Failed to send message. Check your connection and retry.";
      setSendError(message);
      setFailedPayload({ type, payload });
    } finally {
      setIsSending(false);
    }
  };

  const retryFailedMessage = async () => {
    if (!failedPayload) return;
    await sendMessage(failedPayload.type, failedPayload.payload);
  };

  const onMessagesScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceToBottom =
      contentSize.height - (layoutMeasurement.height + contentOffset.y);
    setShowJumpToLatest(distanceToBottom > 120);
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
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.replace("/(chat)/Inbox")}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back to inbox"
          >
            <Ionicons name="chevron-back" size={16} color="#5B7CFF" />
            <Text style={styles.backText}>Inbox</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {recipientName}
          </Text>
          {recipientEmail ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {recipientEmail}
            </Text>
          ) : null}
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            accessibilityRole="button"
            accessibilityLabel="Logout"
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
          onContentSizeChange={() => {
            if (!showJumpToLatest) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onScroll={onMessagesScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoadingMessages ? "Loading messages..." : "No messages yet"}
              </Text>
              {isLoadingMessages ? (
                <Text style={styles.emptySubtext}>
                  Syncing conversation history.
                </Text>
              ) : (
                <>
                  <Text style={styles.emptySubtext}>
                    Start a secure conversation with {recipientName}.
                  </Text>
                  <Text style={styles.emptyHint}>
                    End-to-end protected channel
                  </Text>
                </>
              )}
            </View>
          }
        />

        {sendError ? (
          <View style={styles.errorBar}>
            <Ionicons name="alert-circle-outline" size={16} color="#FCA5A5" />
            <Text style={styles.errorText}>{sendError}</Text>
            <TouchableOpacity
              onPress={retryFailedMessage}
              style={styles.errorAction}
            >
              <Text style={styles.errorActionText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSendError(null);
                setFailedPayload(null);
              }}
              style={styles.errorDismiss}
            >
              <Ionicons name="close" size={14} color="#FCA5A5" />
            </TouchableOpacity>
          </View>
        ) : null}

        {showJumpToLatest ? (
          <TouchableOpacity
            style={styles.jumpToLatestButton}
            onPress={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
              setShowJumpToLatest(false);
            }}
          >
            <Ionicons name="arrow-down" size={14} color="#DDE4FF" />
            <Text style={styles.jumpToLatestText}>Latest</Text>
          </TouchableOpacity>
        ) : null}

        <ChatInput
          onSendText={handleSendText}
          onSendImage={handleSendImage}
          onSendAudio={handleSendAudio}
        />

        {isSending ? (
          <View style={styles.sendingStrip}>
            <Text style={styles.sendingText}>Sending...</Text>
          </View>
        ) : null}
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
    paddingBottom: 14,
    backgroundColor: "#10162A",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(91, 124, 255, 0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerLeft: {
    flex: 0,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerRight: {
    flex: 0,
    minWidth: 68,
    alignItems: "flex-end",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    fontSize: 18,
    fontWeight: "700",
    color: "#E9ECF8",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    color: "#9AA7D7",
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    paddingBottom: 18,
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
  emptyHint: {
    fontSize: 12,
    color: "#5B7CFF",
    marginTop: 12,
    fontWeight: "600",
  },
  errorBar: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.45)",
    backgroundColor: "rgba(127, 29, 29, 0.35)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "#FECACA",
    fontSize: 12,
    flex: 1,
    marginLeft: 8,
  },
  errorAction: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  errorActionText: {
    color: "#DDE4FF",
    fontWeight: "700",
    fontSize: 12,
  },
  errorDismiss: {
    marginLeft: 4,
    padding: 2,
  },
  jumpToLatestButton: {
    position: "absolute",
    right: 16,
    bottom: 92,
    borderRadius: 18,
    backgroundColor: "rgba(21, 30, 56, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(91, 124, 255, 0.45)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  jumpToLatestText: {
    color: "#DDE4FF",
    fontSize: 12,
    fontWeight: "700",
  },
  sendingStrip: {
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  sendingText: {
    color: "#9AA7D7",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ChatScreen;
