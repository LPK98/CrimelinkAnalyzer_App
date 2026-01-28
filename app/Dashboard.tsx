import SideBar from "@/src/components/SideBar";
import TopBar from "@/src/components/TopBar";
import { icons } from "@/src/constants/icons";
import { images } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/useAuth";
import { Href, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(320, Math.floor(SCREEN_WIDTH * 0.75));

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: isSidebarOpen ? 0 : -SIDEBAR_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: isSidebarOpen ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSidebarOpen, overlayOpacity, slideX]);

  const menuItems: { name: string; route: Href; icon: any }[] = [
    {
      name: "Face Recognition",
      route: "/(tabs)/FaceDetection",
      icon: icons.faceRecognition,
    },
    { name: "Weapon Management", route: "/(tabs)/Weapon", icon: icons.weapon },
    { name: "Number Plates", route: "/(tabs)/Plate", icon: icons.numberPlate },
    { name: "Duty Management", route: "/(tabs)/Duty", icon: icons.duty },
    { name: "Safety Zone", route: "/SafetyZone", icon: icons.safetyZone },
    { name: "Schedule", route: "/Dashboard", icon: icons.schedule },
    { name: "Messages", route: "/Chat", icon: icons.message },
  ];

  return (
    <SafeAreaView>
      <ImageBackground
        source={images.bgApp}
        className="w-full h-full"
        imageStyle={{ opacity: 0.1 }}
        resizeMode="cover"
      >
        <View className="w-full h-full flex flex-col justify-center items-center gap-5 px-4 py-2">
          <View className="flex-1 items-center px-5 w-full">
            <TopBar
              openSidebar={openSidebar}
              closeSidebar={closeSidebar}
              name={user?.name}
            />
            <Pressable //REMOVE
              onPress={logout}
              className="mt-6 bg-red-600 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold">Logout</Text>
            </Pressable>
          </View>

          {/* Menu buttons */}
          <View className="absolute bottom-4 left-0 right-0 px-4">
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
        </View>
        {/* Sidebar */}
        <Animated.View
          pointerEvents={isSidebarOpen ? "auto" : "none"}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: overlayOpacity,
          }}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.35)" }}
            onPress={closeSidebar}
          />
        </Animated.View>
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: SIDEBAR_WIDTH,
            transform: [{ translateX: slideX }],
            backgroundColor: "white",
            paddingTop: 16,
            paddingHorizontal: 12,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <SideBar />
        </Animated.View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Dashboard;
