import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../theme/ThemeProvider";

type topbarProps = {
  openSidebar: () => void;
  closeSidebar?: () => void;
  name?: string;
};

const TopBar: React.FC<topbarProps> = ({ openSidebar, name }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const displayName = name || user?.name || "Officer";
  const firstName = displayName.split(" ")[0];
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={openSidebar}
        hitSlop={10}
        style={[
          styles.menuButton,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Feather name="menu" color={colors.text} size={22} />
      </Pressable>

      <View
        style={[
          styles.welcomeCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.white }]}>
            {initial}
          </Text>
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.welcomeLabel,
              { color: colors.sidebarItemMutedText },
            ]}
          >
            Welcome Back
          </Text>
          <Text
            style={[styles.welcomeName, { color: colors.text }]}
            numberOfLines={1}
          >
            {firstName}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeCard: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  textContainer: {
    flex: 1,
  },
  welcomeLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  welcomeName: {
    fontSize: 17,
    fontWeight: "700",
  },
});

export default TopBar;
