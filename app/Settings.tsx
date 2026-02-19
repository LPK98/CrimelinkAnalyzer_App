import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import DutyToggleScreen from "./DutyToggleScreen";
import { ChevronLeft } from "lucide-react-native";
import ThemeToggle from "@/src/components/ThemeToggle";
import { router } from "expo-router";
import { useTheme } from "@/src/theme/ThemeProvider";

export default function Settings() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 20,
        gap: 20,
        backgroundColor: colors.background,
      }}
    >
      <TouchableOpacity
        onPress={() => router.replace("/Dashboard")}
        className="p-1"
      >
        <ChevronLeft size={28} color={colors.text} />
      </TouchableOpacity>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: "bold" }}>
        Settings
      </Text>
      <DutyToggleScreen />
      <ThemeToggle />
    </SafeAreaView>
  );
}
