import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";

interface VoiceMessageProps {
  mediaUrl: string;
  isCurrentUser: boolean;
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({
  mediaUrl,
  isCurrentUser,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handlePlayPause = async () => {
    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (
          status.isLoaded &&
          (status.didJustFinish ||
            (status.durationMillis &&
              status.positionMillis >= status.durationMillis))
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
      setIsLoading(false);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
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
          isCurrentUser ? styles.playButtonCurrentUser : styles.playButtonOther,
        ]}
        disabled={isLoading}
      >
        <Text
          style={[
            styles.playIcon,
            isCurrentUser ? styles.iconCurrentUser : styles.iconOther,
          ]}
        >
          {isLoading ? "⏳" : isPlaying ? "⏸" : "▶"}
        </Text>
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
              isCurrentUser
                ? styles.progressCurrentUser
                : styles.progressOther,
            ]}
          />
        </View>
        <Text
          style={[
            styles.timeText,
            isCurrentUser ? styles.timeCurrentUser : styles.timeOther,
          ]}
        >
          {formatTime(isPlaying || position > 0 ? position : duration)}
        </Text>
      </View>
    </View>
  );
};

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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  playButtonCurrentUser: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  playButtonOther: {
    backgroundColor: "rgba(18, 20, 32, 0.15)",
  },
  playIcon: {
    fontSize: 16,
  },
  iconCurrentUser: {
    color: "#FFFFFF",
  },
  iconOther: {
    color: "#121420",
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
  progressCurrentUser: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  progressOther: {
    backgroundColor: "#121420",
  },
  timeText: {
    fontSize: 10,
    marginTop: 3,
  },
  timeCurrentUser: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  timeOther: {
    color: "#999",
  },
});

export default VoiceMessage;
