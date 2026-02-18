import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ImageMessage from "./ImageMessage";
import VoiceMessage from "./VoiceMessage";
import type { ChatMessage } from "@/src/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
}) => {
  const renderContent = () => {
    switch (message.messageType) {
      case "image":
        return message.mediaUrl ? (
          <ImageMessage
            mediaUrl={message.mediaUrl}
            isCurrentUser={isCurrentUser}
          />
        ) : null;

      case "audio":
        return message.mediaUrl ? (
          <VoiceMessage
            mediaUrl={message.mediaUrl}
            isCurrentUser={isCurrentUser}
          />
        ) : null;

      case "text":
      default:
        return (
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText,
            ]}
          >
            {message.content}
          </Text>
        );
    }
  };

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      {!isCurrentUser && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}

      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          message.messageType === "image" && styles.imageBubble,
        ]}
      >
        {renderContent()}

        {message.createdAt && (
          <Text
            style={[
              styles.timestamp,
              isCurrentUser
                ? styles.currentUserTimestamp
                : styles.otherUserTimestamp,
            ]}
          >
            {formatTime(message.createdAt)}
          </Text>
        )}
      </View>
    </View>
  );
};

/**
 * Format an ISO timestamp string into a readable time string.
 */
const formatTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

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
  senderName: {
    fontSize: 11,
    color: "#888",
    marginBottom: 2,
    marginLeft: 8,
    fontWeight: "600",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  currentUserBubble: {
    backgroundColor: "#121420",
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
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
    color: "#1A1A1A",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  currentUserTimestamp: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  otherUserTimestamp: {
    color: "#999",
  },
});

export default MessageBubble;
