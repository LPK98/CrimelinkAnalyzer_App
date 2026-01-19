import SideBar from "@/src/components/SideBar";
import { icons } from "@/src/constants/icons";
import { images } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/useAuth";
import { Href, router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems: { name: string; route: Href; icon: any }[] = [
    {
      name: "Face Recognition",
      route: "/(tabs)/FaceDetection",
      icon: icons.faceRecognition,
    },
    { name: "Weapon Management", route: "/(tabs)/Weapon", icon: icons.weapon },
    { name: "Number Plates", route: "/(tabs)/Plate", icon: icons.numberPlate },
    { name: "Duty Management", route: "/(tabs)/Duty", icon: icons.duty },
    { name: "Safety Zone", route: "/Dashboard", icon: icons.safetyZone },
    { name: "Schedule", route: "/Dashboard", icon: icons.schedule },
    { name: "Messages", route: "/Dashboard", icon: icons.message },
  ];

  // FIXME:
  if (isSidebarOpen) {
    return (
      <View className="flex justify-center items-center h-full">
        <Pressable onPress={() => router.replace("/Dashboard")}>
          <Text> Dashboard</Text>
        </Pressable>
        <SideBar />
      </View>
    );
  }

  return (
    <SafeAreaView>
      <ImageBackground
        source={images.bgApp}
        className="w-full h-full"
        imageStyle={{ opacity: 0.1 }}
        resizeMode="cover"
      >
        <View className="w-full h-full flex flex-col  justify-center items-center gap-5 px-4 py-2">
          <View className="flex flex-row gap-5 justify-start items-center w-full">
            <Pressable onPress={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Image
                source={icons.hamburgerMenu}
                style={{ width: 30, height: 30 }}
                resizeMode="contain"
              />
            </Pressable>
            <View className="flex flex-row gap-3 justify-start items-center w-full px-4">
              <Image
                source={images.profile}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
              <Text className="text-md font-semiboldtext-gray-600">{`Welcome, ${user?.name}`}</Text>
            </View>
          </View>
          <Pressable
            onPress={logout}
            className="mt-6 bg-red-600 rounded-xl py-3 items-center"
          >
            <Text className="text-white font-semibold">Logout</Text>
          </Pressable>

          {/* Menu buttons */}
          <FlatList
            data={menuItems}
            numColumns={3}
            keyExtractor={(item) => item.name}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 16,
              gap: 16,
            }}
            renderItem={({ item, index }) => (
              <Pressable
                key={index}
                className="flex items-center justify-center h-28 w-28"
                onPress={() => router.replace(item.route)}
              >
                <View className="bg-white p-2 rounded-2xl">
                  <Image
                    style={{ width: 40, height: 40, marginBottom: 8 }}
                    source={item.icon}
                    resizeMode="contain"
                  />
                </View>
                <Text className="text-textSecondary text-center font-medium text-sm">
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Dashboard;
