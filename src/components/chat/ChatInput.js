/**
 * ChatInput Component
 *
 * Enhanced input bar with:
 * - Text input + Send button
 * - Image picker button (📷) — camera or gallery
 * - Voice record button (🎤) — tap to start/stop recording
 *
 * Handles permissions for camera, media library, and microphone.
 * The app does not crash if permissions are denied.
 */

import { Audio, RecordingPresets, useAudioRecorder } from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { uploadAudio, uploadImage } from "../../utils/mediaUpload";

const ChatInput = ({ onSendText, onSendImage, onSendAudio }) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // ─── Text Sending ───

  const handleSendText = () => {
    const trimmed = message.trim();
    if (trimmed.length === 0) return;
    onSendText(trimmed);
    setMessage("");
  };

  // ─── Image Picking ───

  /**
   * Pick image from media library with permission check
   */
  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to send images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        try {
          const url = await uploadImage(result.assets[0].uri);
          onSendImage(url);
        } catch (error) {
          Alert.alert("Upload Failed", error.message);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  /**
   * Take a photo with camera with permission check
   */
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow camera access to take photos.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        try {
          const url = await uploadImage(result.assets[0].uri);
          onSendImage(url);
        } catch (error) {
          Alert.alert("Upload Failed", error.message);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  /**
   * Show action sheet to choose between camera and gallery
   */
  const handleImagePress = () => {
    if (isUploading) return;
    Alert.alert("Send Image", "Choose an option", [
      { text: "Camera", onPress: handleTakePhoto },
      { text: "Gallery", onPress: handlePickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ─── Voice Recording ───

  /**
   * Start recording audio with microphone permission check
   */
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestRecordingPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow microphone access to send voice messages.",
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  /**
   * Stop recording and upload the audio file
   */
  const stopRecording = async () => {
    try {
      if (!audioRecorder) return;

      setIsRecording(false);
      await audioRecorder.stop();
      await Audio.setAudioModeAsync({ allowsRecording: false });

      const uri = audioRecorder.uri;

      if (uri) {
        setIsUploading(true);
        try {
          const url = await uploadAudio(uri);
          onSendAudio(url);
        } catch (error) {
          Alert.alert("Upload Failed", error.message);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setIsRecording(false);
    }
  };

  /**
   * Toggle voice recording on/off
   */
  const handleVoicePress = () => {
    if (isUploading) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      {/* Upload indicator */}
      {isUploading && (
        <View style={styles.uploadingBar}>
          <ActivityIndicator size="small" color="#6C63FF" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        {/* Image Picker Button */}
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={handleImagePress}
          disabled={isUploading || isRecording}
          activeOpacity={0.7}
        >
          <Text style={styles.mediaButtonIcon}>📷</Text>
        </TouchableOpacity>

        {/* Voice Record Button */}
        <TouchableOpacity
          style={[styles.mediaButton, isRecording && styles.recordingActive]}
          onPress={handleVoicePress}
          disabled={isUploading}
          activeOpacity={0.7}
        >
          <Text style={styles.mediaButtonIcon}>{isRecording ? "⏹" : "🎤"}</Text>
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={isRecording ? "Recording..." : "Type a message..."}
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!isRecording && !isUploading}
        />

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            message.trim().length === 0 && styles.sendButtonDisabled,
          ]}
          onPress={handleSendText}
          disabled={message.trim().length === 0 || isUploading || isRecording}
          activeOpacity={0.7}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  uploadingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    backgroundColor: "#F5F3FF",
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#6C63FF",
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  mediaButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
    backgroundColor: "#F5F5F5",
  },
  recordingActive: {
    backgroundColor: "#FFE0E0",
  },
  mediaButtonIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1A1A1A",
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
  },
  sendButtonDisabled: {
    backgroundColor: "#B8B5E0",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default ChatInput;
