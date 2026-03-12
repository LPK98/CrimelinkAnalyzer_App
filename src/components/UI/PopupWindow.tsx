import React from "react";
import { StyleSheet, View } from "react-native";

const PopupWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.modalCard}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 999,
    elevation: 999,
  },
  modalCard: {
    width: "90%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
});

export default PopupWindow;
