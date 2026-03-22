import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";

type ImageMessageProps = {
  mediaUrl: string;
  isCurrentUser: boolean;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ImageMessage({
  mediaUrl,
  isCurrentUser,
}: ImageMessageProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setFullscreen(true)}
      >
        <View style={styles.imageContainer}>
          {loading && (
            <ActivityIndicator
              style={styles.loader}
              color={isCurrentUser ? colors.white : colors.primary}
            />
          )}
          <Image
            source={{ uri: mediaUrl }}
            style={styles.image}
            resizeMode="cover"
            onLoadEnd={() => setLoading(false)}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={fullscreen}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreen(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={[
              styles.closeButton,
              {
                backgroundColor: "rgba(255,255,255,0.22)",
                borderColor: colors.border,
              },
            ]}
            onPress={() => setFullscreen(false)}
          >
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>

          <Image
            source={{ uri: mediaUrl }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  loader: {
    position: "absolute",
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  fullImage: {
    width: screenWidth,
    height: screenHeight * 0.72,
  },
});
