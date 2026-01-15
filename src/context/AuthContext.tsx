import { router } from "expo-router";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { getUser } from "../auth/auth";
import { AuthContextType, AuthUser } from "../types/AuthContextDefinition";
import { loginFieldOfficer, logout as doLogout } from "../services/authService";

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user on app open
    (async () => {
      try {
        const saved = await getUser();
        if (saved) setUser(saved);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const loggedUser = await loginFieldOfficer(username, password);
    setUser(loggedUser);
    router.replace("/(tabs)/Dashboard");
  };

  const logout = async () => {
    await doLogout();
    setUser(null);
    router.replace("/login");
  };

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
