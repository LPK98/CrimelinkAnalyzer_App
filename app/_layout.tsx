import { ThemeProvider } from "@/src/theme/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import AuthProvider from "../src/context/AuthContext";
import { useAuth } from "../src/hooks/useAuth";
import "./global.css";
import "./i18n";
import i18n from "./i18n";

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === "/login";

    if (!user && !isAuthRoute) {
      router.replace("/login");
      return;
    }
  }, [user, loading, pathname]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { i18n: activeI18n } = useTranslation();
  const [, setLanguageVersion] = React.useState(0);

  useEffect(() => {
    const restoreLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem("lang");
        if (savedLang) {
          i18n.changeLanguage(savedLang);
        }
      } catch (error) {
        console.log("Language bootstrap skipped:", error);
      }
    };

    restoreLanguage();
  }, []);

  useEffect(() => {
    const handleLanguageChanged = () => {
      setLanguageVersion((version) => version + 1);
    };

    activeI18n.on("languageChanged", handleLanguageChanged);

    return () => {
      activeI18n.off("languageChanged", handleLanguageChanged);
    };
  }, [activeI18n]);

  return (
    <AuthProvider>
      <Guard>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="Dashboard" />
            <Stack.Screen name="Chat" />
            <Stack.Screen name="Settings" />
            <Stack.Screen name="(screens)/Weapon" />
            <Stack.Screen name="(screens)/Plate" />
            <Stack.Screen name="(screens)/Duty" />
            <Stack.Screen name="(screens)/SafetyZone" />
            <Stack.Screen name="(screens)/WeaponRequest" />
            <Stack.Screen name="(screens)/BulletRequest" />
            <Stack.Screen name="(screens)/[serialNo]" />
          </Stack>
        </ThemeProvider>
      </Guard>
    </AuthProvider>
  );
}
