import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { icons } from "../constants/icons";
import { useAuth } from "../hooks/useAuth";
import DutyToggleScreen from "@/app/DutyToggleScreen";

const SideBar = () => {
  const { user, logout } = useAuth();

  const menuItems: { name: string; onPress: () => void; icon: any }[] = [
    {
      name: "Contact Us",
      onPress: () => router.replace("/Dashboard"),
      icon: icons.contactUs,
    },
    {
      name: "Translate",
      onPress: () => router.replace("/Dashboard"),
      icon: icons.translate,
    },
    {
      name: "FAQ",
      onPress: () => router.replace("/Dashboard"),
      icon: icons.faq,
    },
    {
      name: "Settings",
      onPress: () => router.replace("/Dashboard"),
      icon: icons.settings,
    },
    {
      name: "Logout",
      onPress: logout,
      icon: icons.logout,
    },
  ];

  return (
    <View>
      <Text className="text-2xl">SideBar</Text>
      {menuItems.map((item, index) => (
        <Pressable
          key={index}
          className="flex flex-row items-center justify-start gap-5 my-4"
          onPress={item.onPress}
        >
          <View>
            <Image source={item.icon} />
          </View>
          <Text>{item.name}</Text>
        </Pressable>
      ))}
      <View>
        <DutyToggleScreen />
      </View>
    </View>
  );
};

export default SideBar;
