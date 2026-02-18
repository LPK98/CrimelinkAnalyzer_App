import { router } from "expo-router";
import React, { createContext, useEffect, useMemo, useState } from "react";
import {
  getRefreshToken,
  getUser,
  isBiometricsEnabled,
  setBiometricsEnabled,
  setTokens,
  setUser,
} from "../auth/auth";
import {
  logout as doLogout,
  fetchMe,
  loginFieldOfficer,
  refreshSession,
} from "../services/authService";
import { AuthContextType, AuthUser } from "../types/AuthContextDefinition";

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user on app open (unless biometric login is enabled)
    (async () => {
      try {
        const biometricEnabled = await isBiometricsEnabled();
        const refreshToken = await getRefreshToken();

        if (biometricEnabled && refreshToken) {
          // Force the login screen so the user can unlock via biometrics.
          setUserState(null);
          return;
        }

        const saved = await getUser();
        if (saved) setUserState(saved);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (
    username: string,
    password: string,
    biometricEnabled?: boolean,
  ) => {
    const loggedUser = await loginFieldOfficer(username, password);
    setUserState(loggedUser.user);
    await setUser(loggedUser.user);

    if (biometricEnabled) {
      await setTokens(loggedUser.accessToken, loggedUser.refreshToken);
      await setBiometricsEnabled(true);
    } else {
      await setTokens(loggedUser.accessToken);
      await setBiometricsEnabled(false);
    }

    return loggedUser;
  };

  const loginWithRefreshToken = async (refreshToken?: string) => {
    const token = refreshToken ?? (await getRefreshToken());
    if (!token) throw new Error("No saved session. Login first.");

    const data = await refreshSession(token);

    await setTokens(data.accessToken, data.refreshToken ?? token);
    await setBiometricsEnabled(true);

    try {
      const me = await fetchMe();
      setUserState(me);
      await setUser(me);
    } catch (err) {
      // Fallback: if the backend doesn't support a "me" endpoint, use the last saved user.
      const saved = await getUser();
      if (!saved) throw err;
      setUserState(saved);
      await setUser(saved);
    }

    router.replace("/Dashboard");
  };

  const logout = async () => {
    await doLogout();
    setUserState(null);
    router.replace("/login");
  };

  const value = useMemo(
    () => ({ user, loading, login, loginWithRefreshToken, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
