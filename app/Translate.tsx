import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import i18n from "./i18n";

type LanguageOption = {
  name: AppLanguage;
  flag: string;
};

type AppLanguage =
  | "English"
  | "Sinhala"
  | "Tamil"
  | "Spanish"
  | "French"
  | "German"
  | "Chinese";

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { name: "English", flag: "🇺🇸" },
  { name: "Sinhala", flag: "🇱🇰" },
  { name: "Tamil", flag: "🇮🇳" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" },
  { name: "Chinese", flag: "🇨🇳" },
];

const UI_TRANSLATIONS: Record<
  AppLanguage,
  {
    profile: string;
    selectLanguage: string;
    updateLanguage: string;
    brand: string;
  }
> = {
  English: {
    profile: "Profile",
    selectLanguage: "Select Language",
    updateLanguage: "Update Language",
    brand: "Crime Link Analyzer",
  },
  Sinhala: {
    profile: "පැතිකඩ",
    selectLanguage: "භාෂාව තෝරන්න",
    updateLanguage: "භාෂාව යාවත්කාලීන කරන්න",
    brand: "Crime Link Analyzer",
  },
  Tamil: {
    profile: "சுயவிவரம்",
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
    updateLanguage: "மொழியைப் புதுப்பிக்கவும்",
    brand: "Crime Link Analyzer",
  },
  Spanish: {
    profile: "Perfil",
    selectLanguage: "Seleccionar idioma",
    updateLanguage: "Actualizar idioma",
    brand: "Crime Link Analyzer",
  },
  French: {
    profile: "Profil",
    selectLanguage: "Choisir la langue",
    updateLanguage: "Mettre a jour la langue",
    brand: "Crime Link Analyzer",
  },
  German: {
    profile: "Profil",
    selectLanguage: "Sprache auswahlen",
    updateLanguage: "Sprache aktualisieren",
    brand: "Crime Link Analyzer",
  },
  Chinese: {
    profile: "个人资料",
    selectLanguage: "选择语言",
    updateLanguage: "更新语言",
    brand: "Crime Link Analyzer",
  },
};

const LANGUAGE_DISPLAY_NAMES: Record<
  AppLanguage,
  Record<AppLanguage, string>
> = {
  English: {
    English: "English",
    Sinhala: "Sinhala",
    Tamil: "Tamil",
    Spanish: "Spanish",
    French: "French",
    German: "German",
    Chinese: "Chinese",
  },
  Sinhala: {
    English: "ඉංග්රීසි",
    Sinhala: "සිංහල",
    Tamil: "දෙමළ",
    Spanish: "ස්පාඤ්ඤ",
    French: "ප්රංශ",
    German: "ජර්මන්",
    Chinese: "චීන",
  },
  Tamil: {
    English: "ஆங்கிலம்",
    Sinhala: "சிங்களம்",
    Tamil: "தமிழ்",
    Spanish: "ஸ்பானிஷ்",
    French: "பிரெஞ்சு",
    German: "ஜெர்மன்",
    Chinese: "சீனம்",
  },
  Spanish: {
    English: "Ingles",
    Sinhala: "Cingales",
    Tamil: "Tamil",
    Spanish: "Espanol",
    French: "Frances",
    German: "Aleman",
    Chinese: "Chino",
  },
  French: {
    English: "Anglais",
    Sinhala: "Cinghalais",
    Tamil: "Tamoul",
    Spanish: "Espagnol",
    French: "Francais",
    German: "Allemand",
    Chinese: "Chinois",
  },
  German: {
    English: "Englisch",
    Sinhala: "Singhalesisch",
    Tamil: "Tamil",
    Spanish: "Spanisch",
    French: "Franzosisch",
    German: "Deutsch",
    Chinese: "Chinesisch",
  },
  Chinese: {
    English: "英语",
    Sinhala: "僧伽罗语",
    Tamil: "泰米尔语",
    Spanish: "西班牙语",
    French: "法语",
    German: "德语",
    Chinese: "中文",
  },
};

const Translate: React.FC = () => {
  const { i18n: activeI18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] =
    useState<AppLanguage>("English");
  const [appLanguage, setAppLanguage] = useState<AppLanguage>("English");

  const labels = UI_TRANSLATIONS[appLanguage];

  const handleGlobalLanguageChange = useCallback(
    async (lng: AppLanguage) => {
      activeI18n.changeLanguage(lng);

      try {
        await AsyncStorage.setItem("lang", lng);
      } catch (error) {
        console.log("Language save skipped:", error);
      }
    },
    [activeI18n],
  );

  useEffect(() => {
    const restoreLanguage = async () => {
      try {
        const savedLang = (await AsyncStorage.getItem(
          "lang",
        )) as AppLanguage | null;

        if (savedLang) {
          setSelectedLanguage(savedLang);
          setAppLanguage(savedLang);
          i18n.changeLanguage(savedLang);
        }
      } catch (error) {
        console.log("Language restore skipped:", error);
      }
    };

    restoreLanguage();
  }, []);

  useEffect(() => {
    handleGlobalLanguageChange(selectedLanguage);
    setAppLanguage(selectedLanguage);
  }, [handleGlobalLanguageChange, selectedLanguage]);

  const handleUpdateLanguage = () => {
    setAppLanguage(selectedLanguage);
    handleGlobalLanguageChange(selectedLanguage);
    console.log("Selected language:", selectedLanguage);
  };

  const handleClosePress = () => {
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
        <TouchableOpacity style={styles.closeButton} onPress={handleClosePress}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>JB</Text>
        </View>

        <Text style={styles.userName}>Jineth Bosilu</Text>
        <Text style={styles.userPhone}>07X XXXX XXX</Text>

        <TouchableOpacity style={styles.profileButton} activeOpacity={0.85}>
          <Text style={styles.profileButtonText}>{labels.profile}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconCircle}>
            <Text style={styles.sectionIconText}>文A</Text>
          </View>
          <Text style={styles.sectionTitle}>{labels.selectLanguage}</Text>
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
                  <Text style={styles.languageName}>
                    {LANGUAGE_DISPLAY_NAMES[appLanguage][item.name]}
                  </Text>
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
          <Text style={styles.updateButtonText}>{labels.updateLanguage}</Text>
        </TouchableOpacity>

        <View style={styles.brandingSection}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.brandLogoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>{labels.brand}</Text>
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
  brandLogoImage: {
    width: 64,
    height: 64,
    marginBottom: 14,
  },
  brandText: {
    color: "#0A1022",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default Translate;
