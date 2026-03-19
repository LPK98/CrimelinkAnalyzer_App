import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type LanguageOption = {
  name: string;
  flag: string;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { name: "English", flag: "🇺🇸" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" },
  { name: "Chinese", flag: "🇨🇳" },
];

const Translate: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");

  const handleUpdateLanguage = () => {
    console.log("Selected language:", selectedLanguage);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>JB</Text>
        </View>

        <Text style={styles.userName}>Jineth Bosilu</Text>
        <Text style={styles.userPhone}>07X XXXX XXX</Text>

        <TouchableOpacity style={styles.profileButton} activeOpacity={0.85}>
          <Text style={styles.profileButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconCircle}>
            <Text style={styles.sectionIconText}>文A</Text>
          </View>
          <Text style={styles.sectionTitle}>Select Language</Text>
        </View>

        <View style={styles.languageList}>
          {LANGUAGE_OPTIONS.map((item) => {
            const isSelected = selectedLanguage === item.name;

            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.languageItem,
                  isSelected ? styles.languageItemSelected : null,
                ]}
                activeOpacity={0.9}
                onPress={() => setSelectedLanguage(item.name)}
              >
                <View style={styles.languageLeftGroup}>
                  <Text style={styles.flagText}>{item.flag}</Text>
                  <Text style={styles.languageName}>{item.name}</Text>
                </View>

                {isSelected ? (
                  <View style={styles.selectedIcon}>
                    <Text style={styles.selectedIconText}>✓</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          activeOpacity={0.9}
          onPress={handleUpdateLanguage}
        >
          <Text style={styles.updateButtonText}>Update Language</Text>
        </TouchableOpacity>

        <View style={styles.brandingSection}>
          <View style={styles.brandLogoCircle}>
            <Text style={styles.brandLogoText}>CL</Text>
          </View>
          <Text style={styles.brandText}>Crime Link Analyzer</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070A16",
  },
  contentContainer: {
    paddingBottom: 28,
  },
  headerSection: {
    paddingTop: 46,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 44,
    right: 24,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#9098AD",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#B0B7C7",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E8EBF0",
    borderWidth: 3,
    borderColor: "#4D566D",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#2B3550",
    fontSize: 24,
    fontWeight: "700",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 13,
    color: "#AEB5C4",
    marginBottom: 10,
  },
  profileButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  profileButtonText: {
    color: "#0E1220",
    fontSize: 14,
    fontWeight: "700",
  },
  mainCard: {
    backgroundColor: "#E5E6EB",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingTop: 24,
    paddingHorizontal: 18,
    paddingBottom: 22,
    minHeight: 760,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F5F6F8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionIconText: {
    color: "#0B0F1D",
    fontSize: 22,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0E1220",
  },
  languageList: {
    marginTop: 4,
    gap: 12,
    marginBottom: 26,
  },
  languageItem: {
    backgroundColor: "#F1F2F4",
    borderRadius: 16,
    paddingHorizontal: 18,
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#10162A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  languageItemSelected: {
    borderColor: "#2F66E3",
    backgroundColor: "#DCE2EC",
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
    color: "#11172C",
  },
  selectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2E66E3",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIconText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },
  updateButton: {
    width: "100%",
    backgroundColor: "#2F66E3",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111A34",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 130,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  brandingSection: {
    alignItems: "center",
  },
  brandLogoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#1038A4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E1630",
    marginBottom: 14,
  },
  brandLogoText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  brandText: {
    color: "#0A1022",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default Translate;
