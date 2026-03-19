import SideBar from "@/src/components/SideBar";
import TopBar from "@/src/components/TopBar";
import { images } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/useAuth";
import { useTheme } from "@/src/theme/ThemeProvider";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LanguageOption = {
  name: string;
  flag: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(320, Math.floor(SCREEN_WIDTH * 0.75));

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { name: "Sinhala", flag: "🇱🇰" },
  { name: "Tamil", flag: "🇱🇰" },
  { name: "English", flag: "🇺🇸" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" },
  { name: "Chinese", flag: "🇨🇳" },
];

const Translate: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const displayName = user?.name || user?.username || "Officer";
  const roleLabel = user?.role ? user.role.replace(/_/g, " ") : "Field Officer";

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleUpdateLanguage = () => {
    console.log("Selected language:", selectedLanguage);
  };

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={images.bgApp} style={styles.bg} resizeMode="cover">
        <View style={[styles.container, { backgroundColor: colors.overlay }]}>
          <View style={styles.header}>
            <TopBar
              openSidebar={openSidebar}
              closeSidebar={closeSidebar}
              name={displayName}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.mainCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.pageTitle, { color: colors.text }]}>Select Language</Text>
              <Text style={[styles.pageSubtitle, { color: colors.sidebarItemMutedText }]}>
                {displayName} ({roleLabel})
              </Text>

              <View style={styles.languageList}>
                {LANGUAGE_OPTIONS.map((item) => {
                  const isSelected = selectedLanguage === item.name;

                  return (
                    <TouchableOpacity
                      key={item.name}
                      style={[
                        styles.languageItem,
                        {
                          backgroundColor: colors.iconSurface,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      activeOpacity={0.9}
                      onPress={() => setSelectedLanguage(item.name)}
                    >
                      <View style={styles.languageLeftGroup}>
                        <Text style={styles.flagText}>{item.flag}</Text>
                        <Text style={[styles.languageName, { color: colors.text }]}>{item.name}</Text>
                      </View>

                      {isSelected ? (
                        <View style={[styles.selectedIcon, { backgroundColor: colors.primary }]}>
                          <Text style={[styles.selectedIconText, { color: colors.white }]}>✓</Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.updateButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.9}
                onPress={handleUpdateLanguage}
              >
                <Text style={[styles.updateButtonText, { color: colors.white }]}>Update Language</Text>
              </TouchableOpacity>

              <View style={styles.brandingSection}>
                <Image source={images.logo} style={styles.logoImage} resizeMode="contain" />
                <Text style={[styles.brandText, { color: colors.text }]}>Crime Link Analyzer</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        <Animated.View
          pointerEvents={isSidebarOpen ? "auto" : "none"}
          style={[StyleSheet.absoluteFillObject, { opacity: overlayOpacity }]}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: colors.overlay }}
            onPress={closeSidebar}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sidebar,
            {
              width: SIDEBAR_WIDTH,
              backgroundColor: colors.sidebarSurface,
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          <SideBar />
        </Animated.View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  header: {
    width: "100%",
    paddingHorizontal: 4,
  },
  contentContainer: {
    paddingTop: 18,
    paddingBottom: 22,
  },
  mainCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingTop: 24,
    paddingHorizontal: 18,
    paddingBottom: 22,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  languageList: {
    marginTop: 4,
    gap: 12,
    marginBottom: 22,
  },
  languageItem: {
    borderRadius: 16,
    paddingHorizontal: 18,
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  languageLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagText: {
    fontSize: 20,
    marginRight: 12,
  },
  languageName: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIconText: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },
  updateButton: {
    width: "100%",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 26,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  brandingSection: {
    alignItems: "center",
  },
  logoImage: {
    width: 64,
    height: 64,
    marginBottom: 14,
  },
  brandText: {
    fontSize: 13,
    fontWeight: "700",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default Translate;
