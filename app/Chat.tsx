import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ChatInput from "@/src/components/chat/ChatInput";
import MessageBubble from "@/src/components/chat/MessageBubble";
import { images } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/useAuth";
import {
  sendMessage,
  subscribeToMessages,
} from "@/src/services/chat/chatService";
import { useTheme } from "@/src/theme/ThemeProvider";
import type { ChatMessage, UploadedPhotoPayload } from "@/src/types/chat";

const Chat = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(
      (nextMessages) => {
        setMessages(nextMessages);
        setLoading(false);
      },
      () => {
        setLoading(false);
        Alert.alert("Chat Error", "Failed to sync messages. Please try again.");
      },
    );

    return () => unsubscribe();
  }, []);

  const senderId = user?.id !== undefined ? String(user.id) : "unknown";
  const senderEmail = user?.username || user?.name || "field-officer";

  const handleSendText = async (text: string) => {
    try {
      await sendMessage({
        type: "text",
        text,
        mediaUrl: null,
        senderId,
        senderEmail,
      });
    } catch {
      Alert.alert("Send Failed", "Could not send the message.");
    }
  };

  const handleSendImage = async (payload: UploadedPhotoPayload) => {
    try {
      await sendMessage({
        type: "image",
        text: null,
        mediaUrl: payload.mediaUrl,
        senderId,
        senderEmail,
        photoUrl: payload.mediaUrl,
        imageName: payload.fileName ?? null,
        imageSize: payload.fileSize ?? null,
        imageWidth: payload.width ?? null,
        imageHeight: payload.height ?? null,
        imageMimeType: payload.mimeType ?? null,
        imageSource: payload.source,
      });
    } catch {
      Alert.alert("Send Failed", "Could not send the image.");
    }
  };

  const handleSendAudio = async (mediaUrl: string) => {
    try {
      await sendMessage({
        type: "audio",
        text: null,
        mediaUrl,
        senderId,
        senderEmail,
      });
    } catch {
      Alert.alert("Send Failed", "Could not send the voice message.");
    }
  };

  const displayName = user?.name || user?.username || "Officer";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        style={styles.bg}
        source={images.bgApp}
        imageStyle={{ opacity: 1 }}
        resizeMode="cover"
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.overlay,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Pressable
                onPress={() =>
                  router.canGoBack() ? router.back() : router.push("/Dashboard")
                }
                hitSlop={10}
                style={[
                  styles.backButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.backText, { color: colors.text }]}>
                  Back
                </Text>
              </Pressable>

              <View
                style={[
                  styles.titleContainer,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Messages
                </Text>
                <Text
                  style={[
                    styles.headerSubtitle,
                    { color: colors.sidebarItemMutedText },
                  ]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.chatPanel,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.secondary,
              },
            ]}
          >
            <KeyboardAvoidingView
              style={styles.chatContainer}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <MessageBubble
                    message={item}
                    isCurrentUser={item.senderId === senderId}
                  />
                )}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() =>
                  listRef.current?.scrollToEnd({ animated: true })
                }
                onLayout={() =>
                  listRef.current?.scrollToEnd({ animated: false })
                }
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.text }]}>
                      {loading ? "Loading messages..." : "No messages yet."}
                    </Text>
                    {!loading && (
                      <Text
                        style={[
                          styles.emptySubtext,
                          { color: colors.sidebarItemMutedText },
                        ]}
                      >
                        Start the conversation.
                      </Text>
                    )}
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
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 0,
  },
  header: {
    width: "100%",
    paddingHorizontal: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    minWidth: 64,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "500",
  },
  chatPanel: {
    marginTop: 18,
    flex: 1,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    borderTopWidth: 0.5,
    overflow: "hidden",
    elevation: 12,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});

export default Chat;
