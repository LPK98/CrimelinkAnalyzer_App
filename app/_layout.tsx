import { ThemeProvider } from "@/src/theme/ThemeProvider";
import { router, Stack, usePathname } from "expo-router";
import React, { useEffect } from "react";
import AuthProvider from "../src/context/AuthContext";
import { useAuth } from "../src/hooks/useAuth";
import "./global.css";

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
