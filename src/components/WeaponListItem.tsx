import { Image, Pressable, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import React from "react";
import { weaponListItemType } from "../types/weaponTypes";
import { images } from "../constants/images";

const WeaponListItem: React.FC<weaponListItemType> = ({ name, imageUrl }) => {
  const { colors } = useTheme();
  return (
    <Pressable onPress={() => router.replace("/WeaponDetails")}>
      <View
        style={{
          backgroundColor: colors.card,
          padding: 10,
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 10,
        }}
      >
        <Image source={imageUrl} style={{ width: 50, height: 50 }} />
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: colors.text }}>{name}</Text>

          <Ionicons name="chevron-forward" color={colors.text} size={24} />
        </View>
      </View>
    </Pressable>
  );
};

export default WeaponListItem;
