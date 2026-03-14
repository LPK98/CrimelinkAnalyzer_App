/**
 * MessageBubble Component
 *
 * Renders a single chat message bubble with alignment based on sender.
 * Supports three message types:
 * - "text": renders text content
 * - "image": renders image preview via ImageMessage
 * - "audio": renders playback controls via VoiceMessage
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ImageMessage from "./ImageMessage";
import VoiceMessage from "./VoiceMessage";

type MessageType = "text" | "image" | "audio";

type MessageBubbleProps = {
  text?: string | null;
  type?: MessageType;
  mediaUrl?: string | null;
  senderEmail?: string;
  isCurrentUser: boolean;
  timestamp?: unknown;
  messageStatus?: "sending" | "sent" | "failed";
};

const MessageBubble = ({
  text,
  type = "text",
  mediaUrl,
  senderEmail,
  isCurrentUser,
  timestamp,
  messageStatus,
}: MessageBubbleProps) => {
  const statusSymbol =
    messageStatus === "sending"
      ? "..."
      : messageStatus === "sent"
        ? "✓"
        : messageStatus === "failed"
          ? "!"
          : "";

  const formattedTime = formatTime(timestamp);
  const footerText = isCurrentUser
    ? [formattedTime, statusSymbol].filter(Boolean).join(" ")
    : formattedTime;

  /**
   * Render the inner content based on message type
   */
  const renderContent = (): React.ReactNode => {
    switch (type) {
      case "image":
        if (!mediaUrl) return null;
        return (
          <ImageMessage mediaUrl={mediaUrl} isCurrentUser={isCurrentUser} />
        );

      case "audio":
        if (!mediaUrl) return null;
        return (
          <VoiceMessage mediaUrl={mediaUrl} isCurrentUser={isCurrentUser} />
        );

      case "text":
      default:
        return (
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText,
            ]}
          >
            {text}
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
      {/* Show sender email for messages from other users */}
      {!isCurrentUser && <Text style={styles.senderEmail}>{senderEmail}</Text>}

      {/* Message bubble */}
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          type === "image" && styles.imageBubble,
        ]}
      >
        {renderContent()}

        {/* Timestamp / delivery status */}
        {Boolean(footerText) && (
          <Text
            style={[
              styles.timestamp,
              isCurrentUser
                ? styles.currentUserTimestamp
                : styles.otherUserTimestamp,
            ]}
          >
            {footerText}
          </Text>
        )}
      </View>
    </View>
  );
};

/**
 * Format a Firestore timestamp into a readable time string
 * @param {Object} timestamp - Firestore timestamp object
 * @returns {string} Formatted time string (e.g., "2:30 PM")
 */
const formatTime = (timestamp: unknown): string => {
  if (!timestamp) return "";
  let date: Date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (
    typeof timestamp === "object" &&
    timestamp !== null &&
    "toDate" in timestamp &&
    typeof timestamp.toDate === "function"
  ) {
    date = timestamp.toDate();
  } else if (typeof timestamp === "string" || typeof timestamp === "number") {
    date = new Date(timestamp);
  } else {
    return "";
  }

  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
  senderEmail: {
    fontSize: 11,
    color: "#888",
    marginBottom: 2,
    marginLeft: 8,
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  currentUserBubble: {
    backgroundColor: "#6C63FF",
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: "#E8E8E8",
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
    color: "#1A1A1A",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  currentUserTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherUserTimestamp: {
    color: "#999",
  },
});

export default MessageBubble;
