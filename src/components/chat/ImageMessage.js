/**
 * ImageMessage Component
 *
 * Renders an image message inside a chat bubble.
 * Displays the image with rounded corners and tap-to-fullscreen support.
 */

import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  ActivityIndicator,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Text,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ImageMessage = ({ mediaUrl, isCurrentUser }) => {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      {/* Thumbnail in chat bubble */}
      <TouchableOpacity activeOpacity={0.8} onPress={() => setFullscreen(true)}>
        <View style={styles.imageContainer}>
          {loading && (
            <ActivityIndicator
              style={styles.loader}
              color={isCurrentUser ? "#FFFFFF" : "#6C63FF"}
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

      {/* Fullscreen image modal */}
      <Modal
        visible={fullscreen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullscreen(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFullscreen(false)}
          >
            <Text style={styles.closeText}>✕</Text>
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
};

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
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
});

export default ImageMessage;
