import React, { createContext, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { AuthContextType, AuthUser } from "./AuthContextDefinition";
import { getUser, clearTokens } from "./auth";
import { loginFieldOfficer, logout as doLogout } from "./authService";

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
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
    router.replace("/(field)/dashboard");
  };

  const logout = async () => {
    await doLogout();
    setUser(null);
    router.replace("/");
  };

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
