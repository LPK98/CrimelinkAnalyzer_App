import WeaponCard from "@/src/components/WeaponCard";
import { useTheme } from "@/src/theme/ThemeProvider";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Weapon = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 10,
      }}
    >
      <View className="w-full h-full flex items-start justify-start">
        <View
          style={{ width: "100%" }}
          className="flex-row items-center gap-4 py-4"
        >
          <Pressable onPress={() => router.replace("/Dashboard")}>
            <Ionicons name="chevron-back" color={colors.text} size={24} />
          </Pressable>
          <Text
            className="text-3xl"
            style={{ color: colors.text, fontWeight: "bold" }}
          >
            Weapon Management
          </Text>
        </View>
        <View>
          <Text style={{ color: colors.text, fontSize: 18 }}>
            Assigned Firearms
          </Text>
          <WeaponCard />
        </View>
        <View>
          <Text style={{ color: colors.text, fontSize: 18 }}>
            Request for a Firearm & Ammiunition
          </Text>
          <Pressable
            onPress={() => router.push("/WeaponRequest")}
            style={{
              backgroundColor: colors.primary,
              padding: 10,
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Request New Firearm
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/BulletRequest")}
            style={{
              backgroundColor: colors.primary,
              padding: 10,
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Request for Ammunition
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Weapon;
