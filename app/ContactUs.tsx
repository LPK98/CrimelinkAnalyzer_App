import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const fontScale = Math.min(Math.max(width / 375, 0.9), 1.15);
const fs = (size: number) => Math.round(size * fontScale);

const ContactUs: React.FC = () => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSendMessage = () => {
    console.log(subject, message);
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/Dashboard");
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>{t("common.back")}</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <View style={styles.profileRow}>
            <View style={styles.avatarPlaceholder} />

            <View style={styles.userInfoBlock}>
              <Text style={styles.userName}>Jijineth Bosilu</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.profileButton} activeOpacity={0.85}>
            <Text style={styles.profileButtonText}>{t("common.profile")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainCard}>
        <Text style={styles.pageTitle}>{t("contact.title")}</Text>

        <View style={styles.contactOptionsRow}>
          <TouchableOpacity style={styles.optionCard} activeOpacity={0.85}>
            <View style={styles.optionIconCircle}>
              <Text style={styles.optionIconText}>C</Text>
            </View>
            <Text style={styles.optionTitle}>{t("contact.callSupport")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard} activeOpacity={0.85}>
            <View style={styles.optionIconCircle}>
              <Text style={styles.optionIconText}>@</Text>
            </View>
            <Text style={styles.optionTitle}>{t("contact.emailUs")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.inputLabel}>{t("contact.subject")}</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder={t("contact.subjectPlaceholder")}
            placeholderTextColor="#7A8294"
            style={styles.subjectInput}
          />

          <Text style={styles.inputLabel}>{t("contact.message")}</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t("contact.messagePlaceholder")}
            placeholderTextColor="#7A8294"
            style={styles.messageInput}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={styles.sendButton}
          activeOpacity={0.9}
          onPress={handleSendMessage}
        >
          <Text style={styles.sendButtonText}>{t("contact.sendMessage")}</Text>
        </TouchableOpacity>

        <View style={styles.brandingSection}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>{t("common.brand")}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#DDE0E6",
  },
  contentContainer: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: "#070A13",
    paddingTop: 44,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1C2338",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: fs(13),
    fontWeight: "600",
    lineHeight: Math.round(fs(13) * 1.4),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#BFC3CC",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userInfoBlock: {
    marginLeft: 14,
    flexShrink: 1,
  },
  userName: {
    fontSize: fs(17),
    fontWeight: "600",
    lineHeight: Math.round(fs(17) * 1.4),
    color: "#FFFFFF",
  },
  profileButton: {
    backgroundColor: "#F7F8FB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  profileButtonText: {
    fontSize: fs(14),
    fontWeight: "700",
    lineHeight: Math.round(fs(14) * 1.4),
    color: "#101426",
  },
  mainCard: {
    flex: 1,
    marginTop: -6,
    backgroundColor: "#F5F6FA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 34,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: fs(20),
    fontWeight: "800",
    lineHeight: Math.round(fs(20) * 1.4),
    color: "#111631",
    marginBottom: 24,
  },
  contactOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 14,
  },
  optionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 14,
    alignItems: "center",
    shadowColor: "#0C1633",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  optionIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#D7E2FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  optionIconText: {
    fontSize: fs(18),
    fontWeight: "700",
    lineHeight: Math.round(fs(18) * 1.4),
    color: "#2D3AA8",
  },
  optionTitle: {
    fontSize: fs(14),
    fontWeight: "500",
    lineHeight: Math.round(fs(14) * 1.4),
    color: "#111631",
  },
  formSection: {
    marginBottom: 26,
  },
  inputLabel: {
    fontSize: fs(13),
    fontWeight: "500",
    lineHeight: Math.round(fs(13) * 1.4),
    color: "#4A566C",
    marginBottom: 10,
    marginTop: 2,
  },
  subjectInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C9CFDA",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: fs(14),
    lineHeight: Math.round(fs(14) * 1.4),
    color: "#131826",
    marginBottom: 18,
  },
  messageInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C9CFDA",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: fs(14),
    lineHeight: Math.round(fs(14) * 1.4),
    color: "#131826",
    minHeight: 180,
  },
  sendButton: {
    width: "100%",
    backgroundColor: "#33349D",
    borderRadius: 18,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#12183D",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 34,
  },
  sendButtonText: {
    color: "#FFFFFF",
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
    color: "#0E132A",
  },
});

export default ContactUs;
