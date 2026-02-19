import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { icons } from "../constants/icons";
import { useAuth } from "../hooks/useAuth";
import DutyToggleScreen from "@/app/DutyToggleScreen";
import { images } from "../constants/images";
import { useTheme } from "../theme/ThemeProvider";

const SideBar = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  const menuItems: { name: string; onPress: () => void; icon: any }[] = [
    {
      name: "Dashboard",
      onPress: () => router.replace("/Dashboard"),
      //FIX : icons from a library
      icon: (
        <Image source={icons.contactUs} style={{ width: 24, height: 24 }} />
      ),
    },
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
      onPress: () => router.replace("/Settings"),
      icon: icons.settings,
    },
    {
      name: "Logout",
      onPress: logout,
      icon: icons.logout,
    },
  ];

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.card, paddingHorizontal: 20 }}
    >
      <View className="flex flex-row gap-3 justify-start items-center w-full px-4">
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 25,
            backgroundColor: colors.primary,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "bold",
              textAlign: "center",
              lineHeight: 40,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text
          style={{ color: colors.text }}
          className="text-md"
        >{`Welcome ${user?.name || "User"}`}</Text>
      </View>
      {menuItems.map((item, index) => (
        <Pressable
          key={index}
          className="flex flex-row items-center justify-start gap-5 my-4"
          onPress={item.onPress}
        >
          <View>
            {item.icon === typeof React.Component ? (
              item.icon
            ) : (
              <Image source={item.icon} style={{ width: 24, height: 24 }} />
            )}
            {/* <Image source={item.icon} /> */}
          </View>
          <Text style={{ color: colors.text }}>{item.name}</Text>
        </Pressable>
      ))}
      <View>
        <DutyToggleScreen />
      </View>
    </View>
  );
};

export default SideBar;
