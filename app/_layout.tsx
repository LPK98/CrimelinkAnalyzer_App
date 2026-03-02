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
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="Dashboard" />
        </Stack>
      </Guard>
    </AuthProvider>
  );
}
