import SideBar from "@/src/components/SideBar";
import TopBar from "@/src/components/TopBar";
import { images } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/useAuth";
import { useTheme } from "@/src/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(320, Math.floor(SCREEN_WIDTH * 0.75));
const { width } = Dimensions.get("window");
const fontScale = Math.min(Math.max(width / 375, 0.9), 1.15);
const fs = (size: number) => Math.round(size * fontScale);

const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSe-gA-FPaVE2F86aCR2_2QoU5kd16cKFpUrFdrRlDJtN7vqoQ/formResponse";

const FORM_FIELDS = {
  badgeNo: "entry.747213235",
  subject: "entry.1126432942",
  message: "entry.1471683999",
};

type FormErrors = {
  badgeNo?: string;
  subject?: string;
  message?: string;
};

const ContactUs: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const slideX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const displayName = user?.name || user?.username || "Officer";
  const roleLabel = user?.role ? user.role.replace(/_/g, " ") : "Field Officer";
  const badgeNo = user?.badgeNo?.trim() ?? "";

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!badgeNo) newErrors.badgeNo = "Badge No is required";
    if (!subject.trim()) newErrors.subject = "Subject is required";
    if (!message.trim()) newErrors.message = "Message is required";

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendMessage = async () => {
    if (!validateForm()) return;
    setLoading(true);

    const body = new URLSearchParams({
      [FORM_FIELDS.badgeNo]: badgeNo,
      [FORM_FIELDS.subject]: subject.trim(),
      [FORM_FIELDS.message]: message.trim(),
    }).toString();

    try {
      const response = await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!response.ok) {
        throw new Error(`Form submission failed with status ${response.status}`);
      }

      Alert.alert("Success", "Your message has been sent successfully.");
      setSubject("");
      setMessage("");
      setError({});
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send the message. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const diadNumber = (number: string) => {
    const scheme = Platform.OS === "ios" ? "telprompt:" : "tel:";
    const url = `${scheme}:${number}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("Don't know how to open URI: " + url);
          Alert.alert("Error", "Unable to open the phone dialer.");
        }
      })
      .catch((err) => {
        console.error("An error occurred", err);
        Alert.alert(
          "Error",
          "An unexpected error occurred while trying to open the phone dialer.",
        );
      });
  };

  const openEmail = (email: string) => {
    const url = `mailto:${email}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("Don't know how to open URI: " + url);
          Alert.alert("Error", "Unable to open the email client.");
        }
      })
      .catch((err) => {
        console.error("An error occurred", err);
        Alert.alert(
          "Error",
          "An unexpected error occurred while trying to open the email client.",
        );
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={images.bgApp}
        style={styles.bg}
        resizeMode="cover"
      >
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
              <Text style={[styles.pageTitle, { color: colors.text }]}>
                Contact Us
              </Text>
              <Text
                style={[
                  styles.pageSubtitle,
                  { color: colors.sidebarItemMutedText },
                ]}
              >
                Signed in as {displayName} ({roleLabel})
              </Text>
              <Text
                style={[
                  styles.pageSubtitle,
                  {
                    color: error.badgeNo ? "#D14343" : colors.sidebarItemMutedText,
                    marginTop: -14,
                    marginBottom: 18,
                  },
                ]}
              >
                Badge No: {badgeNo || "Not available"}
              </Text>

              <View style={styles.contactOptionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: colors.iconSurface,
                      borderColor: colors.border,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => diadNumber("+94761664575")}
                >
                  <View
                    style={[
                      styles.optionIconCircle,
                      { backgroundColor: colors.primaryAccent },
                    ]}
                  >
                    <Ionicons
                      name="call-outline"
                      size={22}
                      color={colors.black}
                    />
                  </View>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    Call Support
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: colors.iconSurface,
                      borderColor: colors.border,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => openEmail("support@crimelink.com")}
                >
                  <View
                    style={[
                      styles.optionIconCircle,
                      { backgroundColor: colors.primaryAccent },
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={22}
                      color={colors.black}
                    />
                  </View>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    Email Us
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: colors.sidebarItemMutedText },
                  ]}
                >
                  Subject
                </Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="What can we help you with?"
                  placeholderTextColor={colors.sidebarItemMutedText}
                  style={[
                    styles.subjectInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                />
                {error.subject ? (
                  <Text style={styles.errorText}>{error.subject}</Text>
                ) : null}

                <Text
                  style={[
                    styles.inputLabel,
                    { color: colors.sidebarItemMutedText },
                  ]}
                >
                  Message
                </Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Enter your message here..."
                  placeholderTextColor={colors.sidebarItemMutedText}
                  style={[
                    styles.messageInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  multiline
                  textAlignVertical="top"
                />
                {error.message ? (
                  <Text style={styles.errorText}>{error.message}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.9}
                onPress={handleSendMessage}
                disabled={loading}
              >
                <Text style={[styles.sendButtonText, { color: colors.white }]}>
                  {loading ? "Sending..." : "Send Message"}
                </Text>
              </TouchableOpacity>

              <View style={styles.brandingSection}>
                <Image
                  source={images.logo}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={[styles.brandText, { color: colors.text }]}>
                  Crime Link Analyzer
                </Text>
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: fs(20),
    fontWeight: "700",
    lineHeight: Math.round(fs(20) * 1.4),
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: fs(13),
    lineHeight: Math.round(fs(13) * 1.4),
    marginBottom: 22,
  },
  contactOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 14,
  },
  optionCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  optionIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: fs(14),
    fontWeight: "500",
    lineHeight: Math.round(fs(14) * 1.4),
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: fs(13),
    fontWeight: "500",
    lineHeight: Math.round(fs(13) * 1.4),
    marginBottom: 10,
    marginTop: 2,
  },
  subjectInput: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: fs(14),
    lineHeight: Math.round(fs(14) * 1.4),
    marginBottom: 18,
  },
  messageInput: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: fs(14),
    lineHeight: Math.round(fs(14) * 1.4),
    minHeight: 180,
  },
  errorText: {
    color: "#D14343",
    fontSize: fs(12),
    marginTop: 8,
    marginBottom: 6,
    fontWeight: "500",
  },
  sendButton: {
    width: "100%",
    borderRadius: 18,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 34,
  },
  sendButtonText: {
    fontSize: fs(16),
    fontWeight: "600",
    lineHeight: Math.round(fs(16) * 1.4),
  },
  brandingSection: {
    alignItems: "center",
  },
  logoImage: {
    width: 78,
    height: 78,
    marginBottom: 14,
  },
  brandText: {
    fontSize: fs(13),
    fontWeight: "800",
    lineHeight: Math.round(fs(13) * 1.4),
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

export default ContactUs;
