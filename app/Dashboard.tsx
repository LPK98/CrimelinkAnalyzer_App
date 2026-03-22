import SideBar from "@/src/components/SideBar";
import TopBar from "@/src/components/TopBar";
import { images } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/useAuth";
import { getAnnouncements } from "@/src/services/announcementService";
import { useTheme } from "@/src/theme/ThemeProvider";
import { Announcement } from "@/src/types/announcement";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(320, Math.floor(SCREEN_WIDTH * 0.75));
const ANNOUNCEMENT_WIDTH = SCREEN_WIDTH - 32;
const AUTO_SLIDE_INTERVAL_MS = 4500;

type MenuItem = {
  name: string;
  route: Href;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
};

const Dashboard = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(
    null,
  );
  const announcementRef = useRef<FlatList<Announcement>>(null);
  const slideX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAnnouncements = async () => {
      setAnnouncementsLoading(true);
      setAnnouncementsError(null);

      try {
        const data = await getAnnouncements();
        if (isMounted) {
          setAnnouncements(data);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
        if (isMounted) {
          setAnnouncementsError("Unable to load announcements at the moment.");
        }
      } finally {
        if (isMounted) {
          setAnnouncementsLoading(false);
        }
      }
    };

    fetchAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

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

  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setActiveAnnouncement((prev) => {
        const nextIndex = (prev + 1) % announcements.length;
        announcementRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const menuItems: MenuItem[] = [
    // {
    //   name: "Face Recognition",
    //   route: "/(screens)/FaceDetection",
    //   icon: icons.faceRecognition,
    // },  //REMOVE: Not implemented yet
    {
      name: "Weapon Management",
      route: "/(screens)/Weapon",
      iconName: "shield-checkmark-outline",
    },
    {
      name: "Plates Lookup",
      route: "/(screens)/Plate",
      iconName: "car-sport-outline",
    },
    {
      name: "Duty Management",
      route: "/(screens)/Duty",
      iconName: "clipboard-outline",
    },
    {
      name: "Safety Zone",
      route: "/(screens)/SafetyZone",
      iconName: "location-outline",
    },
    { name: "Settings", route: "/Settings", iconName: "settings-outline" },
    {
      name: "Messages",
      route: "/Chat",
      iconName: "chatbubble-ellipses-outline",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        style={styles.bg}
        source={images.bgApp}
        imageStyle={{ opacity: 1 }}
        resizeMode="cover"
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.overlay,
            },
          ]}
        >
          <View style={styles.header}>
            <TopBar
              openSidebar={openSidebar}
              closeSidebar={closeSidebar}
              name={user?.name}
            />
          </View>

          <View style={styles.announcementSection}>
            <Text style={[styles.sectionTitle, { color: colors.white }]}>
              Important Announcements
            </Text>
            <FlatList
              ref={announcementRef}
              data={announcements}
              horizontal
              pagingEnabled
              bounces={false}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              snapToInterval={ANNOUNCEMENT_WIDTH}
              decelerationRate="fast"
              getItemLayout={(_, index) => ({
                length: ANNOUNCEMENT_WIDTH,
                offset: ANNOUNCEMENT_WIDTH * index,
                index,
              })}
              onScrollToIndexFailed={({ index }) => {
                setTimeout(() => {
                  announcementRef.current?.scrollToIndex({
                    index,
                    animated: true,
                  });
                }, 120);
              }}
              onMomentumScrollEnd={(event) => {
                const nextIndex = Math.round(
                  event.nativeEvent.contentOffset.x / ANNOUNCEMENT_WIDTH,
                );
                setActiveAnnouncement(nextIndex);
              }}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.announcementCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.tag,
                      {
                        backgroundColor: colors.primaryAccent,
                      },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: colors.black }]}>
                      {item.tag}
                    </Text>
                  </View>
                  <Text
                    style={[styles.announcementTitle, { color: colors.text }]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[styles.announcementMessage, { color: colors.text }]}
                  >
                    {item.message}
                  </Text>
                </View>
              )}
            />

            {announcementsLoading ? (
              <View
                style={[
                  styles.emptyAnnouncementCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.emptyAnnouncementText, { color: colors.text }]}
                >
                  Loading announcements...
                </Text>
              </View>
            ) : null}

            {announcementsError ? (
              <View
                style={[
                  styles.emptyAnnouncementCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.emptyAnnouncementText, { color: colors.text }]}
                >
                  {announcementsError}
                </Text>
              </View>
            ) : null}

            {!announcementsLoading &&
            !announcementsError &&
            announcements.length === 0 ? (
              <View
                style={[
                  styles.emptyAnnouncementCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.emptyAnnouncementText, { color: colors.text }]}
                >
                  No announcements available right now.
                </Text>
              </View>
            ) : null}

            <View style={styles.dotContainer}>
              {announcements.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index === activeAnnouncement
                          ? colors.white
                          : "rgba(255,255,255,0.45)",
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Menu buttons */}
          <View
            style={[
              styles.menuPanel,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.secondary,
              },
            ]}
          >
            <FlatList
              data={menuItems}
              numColumns={3}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.menuListContent}
              columnWrapperStyle={styles.menuRow}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <Pressable
                  key={index}
                  style={styles.menuButton}
                  onPress={() => router.push(item.route)}
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
                    <Ionicons
                      name={item.iconName}
                      size={30}
                      color={colors.primary}
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
    paddingBottom: 0,
  },
  header: {
    width: "100%",
    paddingHorizontal: 4,
  },
  announcementSection: {
    marginTop: 30,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  announcementCard: {
    width: ANNOUNCEMENT_WIDTH,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 150,
    justifyContent: "center",
  },
  emptyAnnouncementCard: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emptyAnnouncementText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.85,
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  tagText: {
    fontWeight: "700",
    fontSize: 12,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  announcementMessage: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  dotContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  menuPanel: {
    marginTop: "auto",
    paddingHorizontal: 16,
    paddingTop: 20,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    borderTopWidth: 0.5,
    elevation: 12,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  menuListContent: {
    paddingBottom: 12,
  },
  menuRow: {
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  menuButton: {
    flex: 1,
    minHeight: 108,
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
  menuText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 18,
  },
});

export default Dashboard;
