import SideBar from "@/src/components/SideBar";
import TopBar from "@/src/components/TopBar";
import { images } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/useAuth";
import { useTheme } from "@/src/theme/ThemeProvider";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FaqItem = {
  question: string;
  answer: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(320, Math.floor(SCREEN_WIDTH * 0.75));

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How can I contact support?",
    answer:
      "You can contact support via call or email from the Contact Us page.",
  },
  {
    question: "How long does it take to get a response?",
    answer: "Typically within 24 hours.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use secure encryption and authentication methods.",
  },
  {
    question: "Can I track my reports?",
    answer: "Yes, you can track reports in real-time within the app.",
  },
  {
    question: "How do I reset my password?",
    answer: 'Use the "Forgot Password" option on the login screen.',
  },
];

const FAQPage: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const displayName = user?.name || user?.username || "Officer";

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleToggle = (index: number) => {
    setActiveIndex((previous) => (previous === index ? null : index));
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
              <Text style={[styles.title, { color: colors.text }]}>Frequently Asked Questions</Text>
              <Text style={[styles.subtitle, { color: colors.sidebarItemMutedText }]}>
                Support guidance for {displayName}
              </Text>

              <View style={styles.faqList}>
                {FAQ_ITEMS.map((item, index) => {
                  const isOpen = activeIndex === index;

                  return (
                    <View
                      key={item.question}
                      style={[
                        styles.faqCard,
                        {
                          backgroundColor: colors.iconSurface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.questionButton}
                        activeOpacity={0.85}
                        onPress={() => handleToggle(index)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel={item.question}
                        accessibilityHint="Double tap to expand or collapse the answer"
                        accessibilityState={{ expanded: isOpen }}
                      >
                        <Text style={[styles.questionText, { color: colors.text }]}>
                          {item.question}
                        </Text>
                        <Text
                          style={[
                            styles.indicator,
                            { color: isOpen ? colors.primary : colors.sidebarItemMutedText },
                          ]}
                        >
                          {isOpen ? "-" : "+"}
                        </Text>
                      </TouchableOpacity>

                      {isOpen ? (
                        <Text style={[styles.answerText, { color: colors.sidebarItemMutedText }]}>
                          {item.answer}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  questionButton: {
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    paddingRight: 10,
    lineHeight: 21,
  },
  indicator: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 24,
    marginTop: -2,
  },
  answerText: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 19,
    paddingHorizontal: 16,
    paddingBottom: 14,
    marginTop: -2,
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

export default FAQPage;
