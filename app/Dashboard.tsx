import SideBar from "@/src/components/SideBar";
import TopBar from "@/src/components/TopBar";
import { icons } from "@/src/constants/icons";
import { images } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/useAuth";
import { useTheme } from "@/src/theme/ThemeProvider";
import { Href, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(320, Math.floor(SCREEN_WIDTH * 0.75));

const Dashboard = () => {
  const { colors } = useTheme();
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
    // {
    //   name: "Face Recognition",
    //   route: "/(tabs)/FaceDetection",
    //   icon: icons.faceRecognition,
    // },  //REMOVE: Not implemented yet
    { name: "Weapon Management", route: "/(tabs)/Weapon", icon: icons.weapon },
    {
      name: "Number Plates Lookup",
      route: "/(tabs)/Plate",
      icon: icons.numberPlate,
    },
    { name: "Duty Management", route: "/(tabs)/Duty", icon: icons.duty },
    { name: "Safety Zone", route: "/SafetyZone", icon: icons.safetyZone },
    { name: "Schedule", route: "/Dashboard", icon: icons.schedule },
    { name: "Messages", route: "/Chat", icon: icons.message },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        style={{ flex: 1 }}
        source={images.bgApp}
        // className="w-full h-full"
        imageStyle={{ opacity: 0.1 }}
        resizeMode="cover"
      >
        <View
          style={{
            backgroundColor: colors.background,
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              paddingHorizontal: 20,
              width: "100%",
            }}
          >
            <TopBar
              openSidebar={openSidebar}
              closeSidebar={closeSidebar}
              name={user?.name}
            />
            <Pressable //REMOVE
              onPress={logout}
              style={{
                marginTop: 24,
                backgroundColor: colors.danger,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: colors.white, fontSize: 16, fontWeight: "600" }}
              >
                Logout
              </Text>
            </Pressable>
          </View>

          {/* Menu buttons */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 16,
              backgroundColor: colors.card,
              paddingTop: 20,
              borderTopLeftRadius: 38,
              borderTopRightRadius: 38,
              borderTopWidth: 0.5,
              borderColor: colors.border,
              elevation: 12,
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.8,
              shadowRadius: 8,
            }}
          >
            <FlatList
              data={menuItems}
              numColumns={3}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.menuListContent}
              columnWrapperStyle={styles.menuRow}
              renderItem={({ item, index }) => (
                <Pressable
                  key={index}
                  style={styles.menuButton}
                  onPress={() => router.replace(item.route)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: colors.iconSurface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Image
                      style={styles.menuIcon}
                      source={item.icon}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[styles.menuText, { color: colors.text }]}>
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
            style={{ flex: 1, backgroundColor: colors.overlay }}
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
            backgroundColor: colors.sidebarSurface,
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

const styles = StyleSheet.create({
  menuContainer: {},
  menuListContent: {
    paddingBottom: 8,
  },
  menuRow: {
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  menuButton: {
    flex: 1,
    minHeight: 116,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  menuIcon: {
    width: 40,
    height: 40,
  },
  menuText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 18,
  },
});

export default Dashboard;
