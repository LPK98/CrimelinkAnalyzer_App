import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { uploadAudio, uploadImage } from "@/src/services/chat/mediaUpload";
import { useTheme } from "@/src/theme/ThemeProvider";
import type { UploadedPhotoPayload } from "@/src/types/chat";

type ChatInputProps = {
  onSendText: (text: string) => Promise<void>;
  onSendImage: (payload: UploadedPhotoPayload) => Promise<void>;
  onSendAudio: (mediaUrl: string) => Promise<void>;
};

export default function ChatInput({
  onSendText,
  onSendImage,
  onSendAudio,
}: ChatInputProps) {
  const { colors } = useTheme();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const handleSendText = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    await onSendText(trimmed);
    setMessage("");
  };

  const uploadPickedImage = async (
    asset: ImagePicker.ImagePickerAsset,
    source: "camera" | "gallery",
  ) => {
    setIsUploading(true);

    try {
      const mediaUrl = await uploadImage(asset.uri);
      await onSendImage({
        mediaUrl,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
        mimeType: asset.mimeType,
        source,
      });
    } catch (error) {
      Alert.alert(
        "Upload Failed",
        error instanceof Error ? error.message : "Could not upload image.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Allow photo library access to send images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPickedImage(result.assets[0], "gallery");
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Allow camera access to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPickedImage(result.assets[0], "camera");
    }
  };

  const handleImagePress = () => {
    if (isUploading || isRecording) return;

    Alert.alert("Send Image", "Choose image source", [
      { text: "Camera", onPress: () => void handleTakePhoto() },
      { text: "Gallery", onPress: () => void handlePickImage() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Allow microphone access to send voice messages.",
      );
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );

    recordingRef.current = recording;
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    setIsRecording(false);
    await recordingRef.current.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

    const uri = recordingRef.current.getURI();
    recordingRef.current = null;
    if (!uri) return;

    setIsUploading(true);

    try {
      const mediaUrl = await uploadAudio(uri);
      await onSendAudio(mediaUrl);
    } catch (error) {
      Alert.alert(
        "Upload Failed",
        error instanceof Error
          ? error.message
          : "Could not upload voice message.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleVoicePress = () => {
    if (isUploading) return;

    if (isRecording) {
      void stopRecording();
      return;
    }

    void startRecording();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      ]}
    >
      {isUploading && (
        <View
          style={[
            styles.uploadingBar,
            {
              backgroundColor: colors.sidebarItemActiveBg,
            },
          ]}
        >
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.uploadingText, { color: colors.primary }]}>
            Uploading...
          </Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity
          style={[
            styles.mediaButton,
            {
              backgroundColor: colors.iconSurface,
              borderColor: colors.border,
            },
          ]}
          onPress={handleImagePress}
          disabled={isUploading}
        >
          <Ionicons name="image-outline" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mediaButton, isRecording && styles.recordingActive]}
          onPress={handleVoicePress}
          disabled={isUploading}
        >
          <Ionicons
            name={isRecording ? "stop-circle-outline" : "mic-outline"}
            size={20}
            color={isRecording ? "#B00020" : colors.primary}
          />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.iconSurface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder={isRecording ? "Recording..." : "Type a message..."}
          placeholderTextColor={colors.sidebarItemMutedText}
          multiline
          maxLength={500}
          editable={!isRecording && !isUploading}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            message.trim().length === 0 && styles.sendButtonDisabled,
            {
              backgroundColor:
                message.trim().length === 0
                  ? colors.sidebarItemMutedText
                  : colors.primary,
            },
          ]}
          onPress={() => void handleSendText()}
          disabled={message.trim().length === 0 || isUploading || isRecording}
        >
          <Ionicons name="send" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#DDDEEA",
  },
  uploadingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    backgroundColor: "#F1F1FB",
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#2F2B7D",
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
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  recordingActive: {
    backgroundColor: "#FFE4EA",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
  },
  sendButtonDisabled: {
    opacity: 0.8,
  },
});
