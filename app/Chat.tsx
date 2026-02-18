import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/src/hooks/useAuth";
import ChatInput from "@/src/components/chat/ChatInput";
import MessageBubble from "@/src/components/chat/MessageBubble";
import {
  getRecentMessages,
  getMessagesSince,
  sendMessage,
} from "@/src/services/chatService";
import type { ChatMessage, SendMessageRequest } from "@/src/types/chat";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const POLL_INTERVAL = 3000; // Poll for new messages every 3 seconds

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const lastTimestampRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentUserId = user?.id ? Number(user.id) : 0;

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      setError(null);
      const msgs = await getRecentMessages();
      setMessages(msgs);
      if (msgs.length > 0) {
        lastTimestampRef.current = msgs[msgs.length - 1].createdAt;
      }
    } catch (err: any) {
      console.error("Failed to load messages:", err);
      setError("Failed to load messages. Pull down to retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for new messages
  const pollNewMessages = useCallback(async () => {
    if (!lastTimestampRef.current) return;
    try {
      const newMsgs = await getMessagesSince(lastTimestampRef.current);
      if (newMsgs.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueNew = newMsgs.filter((m) => !existingIds.has(m.id));
          if (uniqueNew.length === 0) return prev;
          return [...prev, ...uniqueNew];
        });
        lastTimestampRef.current = newMsgs[newMsgs.length - 1].createdAt;
      }
    } catch (err) {
      // Silently ignore polling errors — they'll retry next interval
    }
  }, []);

  useEffect(() => {
    loadMessages();

    // Start polling
    pollIntervalRef.current = setInterval(pollNewMessages, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [loadMessages, pollNewMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // ─── Send handlers ───

  const handleSendText = async (text: string) => {
    if (!currentUserId) return;
    setSending(true);
    try {
      const request: SendMessageRequest = {
        senderId: currentUserId,
        messageType: "text",
        content: text,
      };
      const newMsg = await sendMessage(request);
      setMessages((prev) => [...prev, newMsg]);
      lastTimestampRef.current = newMsg.createdAt;
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSendImage = async (mediaUrl: string) => {
    if (!currentUserId) return;
    setSending(true);
    try {
      const request: SendMessageRequest = {
        senderId: currentUserId,
        messageType: "image",
        mediaUrl,
      };
      const newMsg = await sendMessage(request);
      setMessages((prev) => [...prev, newMsg]);
      lastTimestampRef.current = newMsg.createdAt;
    } catch (err: any) {
      console.error("Failed to send image:", err);
      setError("Failed to send image. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSendAudio = async (mediaUrl: string) => {
    if (!currentUserId) return;
    setSending(true);
    try {
      const request: SendMessageRequest = {
        senderId: currentUserId,
        messageType: "audio",
        mediaUrl,
      };
      const newMsg = await sendMessage(request);
      setMessages((prev) => [...prev, newMsg]);
      lastTimestampRef.current = newMsg.createdAt;
    } catch (err: any) {
      console.error("Failed to send voice message:", err);
      setError("Failed to send voice message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // ─── Render ───

  const getUserInitials = (): string => {
    if (!user?.name) return "??";
    const parts = user.name.split(" ");
    return parts
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Pressable
              onPress={() => router.replace("/Dashboard")}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                ChatMe
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Sri Lanka Police Field App
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flexOne}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => setError(null)}>
              <Ionicons name="close" size={18} color="#FF3B30" />
            </Pressable>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              {loading ? (
                <Text style={styles.emptyText}>Loading messages...</Text>
              ) : (
                <>
                  <Text style={styles.emptyText}>No messages yet.</Text>
                  <Text style={styles.emptySubtext}>
                    Be the first to say hello! 👋
                  </Text>
                </>
              )}
            </View>
          )}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isCurrentUser={item.senderId === currentUserId}
            />
          )}
        />

        {/* INPUT */}
        <SafeAreaView style={styles.inputAreaBackground}>
          <ChatInput
            onSendText={handleSendText}
            onSendImage={handleSendImage}
            onSendAudio={handleSendAudio}
            disabled={sending}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F5F7F9" },
  flexOne: { flex: 1 },
  header: {
    backgroundColor: "#121420",
    paddingTop: 15,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "5%",
    marginTop: 50,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontWeight: "700", fontSize: 15, color: "#121420" },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#34C759",
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#121420",
  },
  headerTextContainer: { marginLeft: 12, flexShrink: 1 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  headerSubtitle: { color: "#A0A0A0", fontSize: 12 },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: { color: "#FF3B30", fontSize: 13, flex: 1 },

  listContent: { paddingHorizontal: "3%", paddingVertical: 10, flexGrow: 1 },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#AAA",
    marginTop: 8,
  },

  inputAreaBackground: { backgroundColor: "#fff" },
});

export default Chat;
