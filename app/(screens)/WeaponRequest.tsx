import WeaponListItem from "@/src/components/WeaponListItem";
import { getAllWeapons } from "@/src/services/weapon/weaponService";
import { useTheme } from "@/src/theme/ThemeProvider";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WeaponRequest = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [weapons, setWeapons] = useState([]);

  async function fetchWeapons() {
    try {
      const data = await getAllWeapons();
      setWeapons(data);
      console.log("Fetched weapons:", data[0].weaponType);
    } catch (error) {
      console.error("Failed to fetch weapons:", error);
    }
  }

  useEffect(() => {
    fetchWeapons();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 10,
      }}
    >
      <View
        style={{ width: "100%" }}
        className="flex-row items-center gap-4 py-4"
      >
        <Pressable onPress={() => router.replace("/(screens)/Weapon")}>
          <Ionicons name="chevron-back" color={colors.text} size={24} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>
          Select a Weapon
        </Text>
      </View>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {weapons.map((weapon: any) => (
          <WeaponListItem key={weapon.serialNumber} weapon={weapon} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WeaponRequest;
