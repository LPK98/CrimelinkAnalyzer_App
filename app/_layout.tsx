import { router, Stack, usePathname } from "expo-router";
import React, { useEffect } from "react";
import AuthProvider from "../src/auth/AuthContext";
import { useAuth } from "../src/auth/useAuth";
import "./global.css";

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isFieldRoute = pathname.startsWith("/(field)");
    const isAuthRoute = pathname.startsWith("/(auth)");

    if (!user && isFieldRoute) {
      router.replace("/(auth)/login");
    }

    // Logged in but still on auth routes (login)
    if (user && isAuthRoute) {
      router.replace("/(field)/dashboard");
    }
  }, [user, loading, pathname]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Guard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </Guard>
    </AuthProvider>
  );
}
