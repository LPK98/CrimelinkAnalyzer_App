import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { uploadImage, uploadAudio } from "@/src/utils/mediaUpload";

const { width } = Dimensions.get("window");

interface ChatInputProps {
  onSendText: (text: string) => void;
  onSendImage: (mediaUrl: string) => void;
  onSendAudio: (mediaUrl: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendText,
  onSendImage,
  onSendAudio,
  disabled = false,
}) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // ─── Text Sending ───
  const handleSendText = () => {
    const trimmed = message.trim();
    if (trimmed.length === 0) return;
    onSendText(trimmed);
    setMessage("");
  };

  // ─── Image Picking ───
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
        } catch (error: any) {
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
        } catch (error: any) {
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

  const handleImagePress = () => {
    if (isUploading || disabled) return;
    Alert.alert("Send Image", "Choose an option", [
      { text: "Camera", onPress: handleTakePhoto },
      { text: "Gallery", onPress: handlePickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ─── Voice Recording ───
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow microphone access to send voice messages.",
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
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      setIsRecording(false);
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        setIsUploading(true);
        try {
          const url = await uploadAudio(uri);
          onSendAudio(url);
        } catch (error: any) {
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

  const handleVoicePress = () => {
    if (isUploading || disabled) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isBusy = isUploading || disabled;

  return (
    <View style={styles.container}>
      {isUploading && (
        <View style={styles.uploadingBar}>
          <ActivityIndicator size="small" color="#121420" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        {/* Image Picker */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleImagePress}
          disabled={isBusy || isRecording}
          activeOpacity={0.7}
        >
          <Ionicons
            name="camera-outline"
            size={width * 0.07}
            color={isBusy ? "#ccc" : "#999"}
          />
        </TouchableOpacity>

        {/* Voice Record */}
        <TouchableOpacity
          style={[styles.iconButton, isRecording && styles.recordingActive]}
          onPress={handleVoicePress}
          disabled={isBusy && !isRecording}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isRecording ? "stop-circle" : "mic-outline"}
            size={width * 0.07}
            color={isRecording ? "#FF3B30" : isBusy ? "#ccc" : "#999"}
          />
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
          editable={!isRecording && !isBusy}
        />

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendCircle,
            (message.trim().length === 0 || isBusy || isRecording) &&
              styles.disabledSend,
          ]}
          onPress={handleSendText}
          disabled={message.trim().length === 0 || isBusy || isRecording}
          activeOpacity={0.8}
        >
          <Ionicons name="paper-plane" size={width * 0.05} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  uploadingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    backgroundColor: "#F0F2F5",
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#121420",
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "3%",
    paddingVertical: 10,
  },
  iconButton: {
    padding: 5,
  },
  recordingActive: {
    backgroundColor: "#FFE0E0",
    borderRadius: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginHorizontal: 8,
    fontSize: 15,
    maxHeight: 100,
    color: "#1A1A1A",
  },
  sendCircle: {
    backgroundColor: "#121420",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledSend: {
    backgroundColor: "#A0A0A0",
  },
});

export default ChatInput;
