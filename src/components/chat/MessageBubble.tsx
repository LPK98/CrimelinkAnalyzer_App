import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";
import type { ChatMessage } from "@/src/types/chat";
import ImageMessage from "./ImageMessage";
import VoiceMessage from "./VoiceMessage";

type MessageBubbleProps = {
  message: ChatMessage;
  isCurrentUser: boolean;
};

const formatTime = (timestamp: ChatMessage["timestamp"]): string => {
  if (!timestamp) return "";

  const date =
    typeof (timestamp as { toDate?: () => Date }).toDate === "function"
      ? (timestamp as { toDate: () => Date }).toDate()
      : new Date(timestamp as Date);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MessageBubble({
  message,
  isCurrentUser,
}: MessageBubbleProps) {
  const { colors } = useTheme();

  const renderContent = () => {
    if (message.type === "image" && message.mediaUrl) {
      return (
        <ImageMessage
          mediaUrl={message.mediaUrl}
          isCurrentUser={isCurrentUser}
        />
      );
    }

    if (message.type === "audio" && message.mediaUrl) {
      return (
        <VoiceMessage
          mediaUrl={message.mediaUrl}
          isCurrentUser={isCurrentUser}
        />
      );
    }

    return (
      <Text
        style={[
          styles.messageText,
          isCurrentUser
            ? [styles.currentUserText, { color: colors.white }]
            : [styles.otherUserText, { color: colors.text }],
        ]}
      >
        {message.text ?? ""}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      {!isCurrentUser && (
        <Text
          style={[styles.senderEmail, { color: colors.sidebarItemMutedText }]}
        >
          {message.senderEmail}
        </Text>
      )}

      <View
        style={[
          styles.bubble,
          isCurrentUser
            ? [
                styles.currentUserBubble,
                {
                  backgroundColor: colors.menuSurface,
                  borderColor: colors.border,
                },
              ]
            : [
                styles.otherUserBubble,
                {
                  backgroundColor: colors.iconSurface,
                  borderColor: colors.border,
                },
              ],
          message.type === "image" && styles.imageBubble,
        ]}
      >
        {renderContent()}

        <Text
          style={[
            styles.timestamp,
            isCurrentUser
              ? [
                  styles.currentUserTimestamp,
                  { color: "rgba(255,255,255,0.72)" },
                ]
              : [
                  styles.otherUserTimestamp,
                  { color: colors.sidebarItemMutedText },
                ],
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
  },
  currentUserContainer: {
    alignItems: "flex-end",
  },
  otherUserContainer: {
    alignItems: "flex-start",
  },
  senderEmail: {
    fontSize: 11,
    color: "#7A7A7A",
    marginBottom: 2,
    marginLeft: 8,
  },
  bubble: {
    maxWidth: "78%",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  currentUserBubble: {
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    borderBottomLeftRadius: 4,
  },
  imageBubble: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  currentUserText: {
    color: "#FFFFFF",
  },
  otherUserText: {
    color: "#191919",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  currentUserTimestamp: {
    fontWeight: "500",
  },
  otherUserTimestamp: {
    fontWeight: "500",
  },
});
