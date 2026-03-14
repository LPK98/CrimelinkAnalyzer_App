/**
 * VoiceMessage Component
 *
 * Renders an audio message with play/pause controls and a progress bar.
 * Uses expo-audio for audio playback.
 */

import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from "expo-audio";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type VoiceMessageProps = {
  mediaUrl: string;
  isCurrentUser: boolean;
};

const VoiceMessage = ({ mediaUrl, isCurrentUser }: VoiceMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const playerRef = useRef<AudioPlayer | null>(null);
  const positionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPositionPolling = () => {
    if (positionTimerRef.current) {
      clearInterval(positionTimerRef.current);
      positionTimerRef.current = null;
    }
  };

  const startPositionPolling = () => {
    stopPositionPolling();
    positionTimerRef.current = setInterval(() => {
      if (!playerRef.current) return;
      setPosition((playerRef.current.currentTime || 0) * 1000);
      setDuration((playerRef.current.duration || 0) * 1000);
      setIsPlaying(!!playerRef.current.playing);
    }, 250);
  };

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      stopPositionPolling();
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
    };
  }, []);

  /**
   * Handle play/pause toggle
   */
  const handlePlayPause = async () => {
    try {
      if (isPlaying && playerRef.current) {
        // Pause playback
        playerRef.current.pause();
        setIsPlaying(false);
        stopPositionPolling();
        return;
      }

      if (playerRef.current) {
        // Resume or replay from beginning if finished
        const didFinish =
          (playerRef.current.duration || 0) > 0 &&
          (playerRef.current.currentTime || 0) >=
            (playerRef.current.duration || 0);
        if (didFinish) {
          await playerRef.current.seekTo(0);
        }
        playerRef.current.play();
        setIsPlaying(true);
        startPositionPolling();
        return;
      }

      // Create and play new player
      setIsLoading(true);
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      const player = createAudioPlayer({ uri: mediaUrl });
      playerRef.current = player;
      player.play();

      player.addListener("playbackStatusUpdate", (status: AudioStatus) => {
        if (!status?.isLoaded) return;
        setDuration((status.duration || 0) * 1000);
        setPosition((status.currentTime || 0) * 1000);
        setIsPlaying(!!status.playing);
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPosition(0);
          stopPositionPolling();
        }
      });

      setIsPlaying(true);
      startPositionPolling();
      setIsLoading(false);
    } catch (error: unknown) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
      stopPositionPolling();
      setIsLoading(false);
    }
  };

  /**
   * Format milliseconds to M:SS
   */
  const formatTime = (millis: number): string => {
    if (!millis || millis <= 0) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progress =
    duration > 0 ? Math.min((position / duration) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      {/* Play/Pause Button */}
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

      {/* Progress Bar and Time */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` },
              isCurrentUser ? styles.progressCurrentUser : styles.progressOther,
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
    backgroundColor: "rgba(108, 99, 255, 0.15)",
  },
  playIcon: {
    fontSize: 16,
  },
  iconCurrentUser: {
    color: "#FFFFFF",
  },
  iconOther: {
    color: "#6C63FF",
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
    backgroundColor: "#6C63FF",
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
