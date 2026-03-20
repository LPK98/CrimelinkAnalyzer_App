import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";
import { images } from "../constants/images";
import { useTheme } from "../theme/ThemeProvider";
import { weaponListItemType } from "../types/weaponTypes";

const WeaponListItem: React.FC<weaponListItemType> = ({
  weapon,
  name,
  imageUrl,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const weaponName = weapon?.weaponType ?? name ?? "Unknown Weapon";
  const serialNo = weapon?.serialNumber;

  const handlePress = () => {
    if (!serialNo) return;

    router.push({
      pathname: "/[serialNo]",
      params: {
        serialNo,
        weaponType: weapon?.weaponType,
        status: weapon?.status,
        updatedDate: weapon?.updatedDate
          ? String(weapon.updatedDate)
          : undefined,
        registerDate: weapon?.registerDate
          ? String(weapon.registerDate)
          : undefined,
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!serialNo}
      style={{ width: "100%", opacity: serialNo ? 1 : 0.7 }}
    >
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
        <Image
          source={imageUrl ?? images.logo}
          style={{ width: 50, height: 50 }}
        />
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: colors.text }}>{weaponName}</Text>

          <Ionicons name="chevron-forward" color={colors.text} size={24} />
        </View>
      </View>
    </Pressable>
  );
};

export default WeaponListItem;
