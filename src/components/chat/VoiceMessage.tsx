import { Audio, type AVPlaybackStatus } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";

type VoiceMessageProps = {
  mediaUrl: string;
  isCurrentUser: boolean;
};

export default function VoiceMessage({
  mediaUrl,
  isCurrentUser,
}: VoiceMessageProps) {
  const { colors } = useTheme();
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        void soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    setDuration(status.durationMillis ?? 0);
    setPosition(status.positionMillis ?? 0);

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        const durationMillis = status.isLoaded
          ? (status.durationMillis ?? 0)
          : 0;
        const positionMillis = status.isLoaded
          ? (status.positionMillis ?? 0)
          : 0;

        if (
          status.isLoaded &&
          (status.didJustFinish || positionMillis >= durationMillis)
        ) {
          await soundRef.current.setPositionAsync(0);
        }

        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }

      setIsLoading(true);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: mediaUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      );

      soundRef.current = sound;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (millis: number): string => {
    if (!millis || millis <= 0) return "0:00";

    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePlayPause}
        style={[
          styles.playButton,
          isCurrentUser
            ? [
                styles.currentUserButton,
                { backgroundColor: "rgba(255,255,255,0.25)" },
              ]
            : [
                styles.otherUserButton,
                {
                  backgroundColor: colors.sidebarItemActiveBg,
                  borderColor: colors.border,
                },
              ],
        ]}
        disabled={isLoading}
      >
        <Text
          style={[
            styles.playIcon,
            isCurrentUser
              ? [styles.currentUserIcon, { color: colors.white }]
              : [styles.otherUserIcon, { color: colors.primary }],
          ]}
        >
          {isLoading ? "..." : isPlaying ? "II" : ">"}
        </Text>
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
              isCurrentUser
                ? [
                    styles.currentUserProgress,
                    { backgroundColor: "rgba(255,255,255,0.75)" },
                  ]
                : [
                    styles.otherUserProgress,
                    { backgroundColor: colors.primary },
                  ],
            ]}
          />
        </View>

        <Text
          style={[
            styles.timeText,
            isCurrentUser
              ? [styles.currentUserTime, { color: "rgba(255,255,255,0.78)" }]
              : [styles.otherUserTime, { color: colors.sidebarItemMutedText }],
          ]}
        >
          {formatTime(isPlaying || position > 0 ? position : duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 180,
    paddingVertical: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  currentUserButton: {
    borderColor: "transparent",
  },
  otherUserButton: {
    borderColor: "transparent",
  },
  playIcon: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  currentUserIcon: {
    color: "#FFFFFF",
  },
  otherUserIcon: {
    color: "#2F2B7D",
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  currentUserProgress: {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  otherUserProgress: {
    backgroundColor: "#2F2B7D",
  },
  timeText: {
    fontSize: 10,
    marginTop: 3,
  },
  currentUserTime: {
    color: "rgba(255, 255, 255, 0.78)",
  },
  otherUserTime: {
    color: "#808080",
  },
});
