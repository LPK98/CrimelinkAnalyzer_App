import {
  getBoolFromPrefs,
  getStringFromPrefs,
  removeKey,
  saveBoolToPrefs,
  saveStringToPrefs,
} from "../utils/secureStore";
import type { ThemeMode } from "../types/themeMode";
import { storage } from "./storage";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const BIOMETRICS_ENABLED = "biometrics_enabled";
const DUTY_TRACKING_ENABLED = "duty_tracking_enabled";
const THEME_MODE = "theme_mode";
const USER_KEY = "auth_user";

export async function setTokens(accessToken: string, refreshToken?: string) {
  await saveStringToPrefs(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await saveStringToPrefs(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function getAccessToken() {
  return getStringFromPrefs(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return getStringFromPrefs(REFRESH_TOKEN_KEY);
}

export async function setBiometricsEnabled(enabled: boolean) {
  await saveBoolToPrefs(BIOMETRICS_ENABLED, enabled);
}

export async function isBiometricsEnabled() {
  return getBoolFromPrefs(BIOMETRICS_ENABLED);
}

export async function setDutyTrackingEnabled(enabled: boolean) {
  await saveBoolToPrefs(DUTY_TRACKING_ENABLED, enabled);
}

export async function isDutyTrackingEnabled() {
  return getBoolFromPrefs(DUTY_TRACKING_ENABLED);
}

export async function setThemeModePreference(mode: ThemeMode) {
  await saveStringToPrefs(THEME_MODE, mode);
}

export async function getThemeModePreference(): Promise<ThemeMode | null> {
  const savedMode = await getStringFromPrefs(THEME_MODE);

  if (
    savedMode === "system" ||
    savedMode === "light" ||
    savedMode === "dark"
  ) {
    return savedMode;
  }

  return null;
}

export async function clearTokens() {
  await removeKey(ACCESS_TOKEN_KEY);
  await removeKey(REFRESH_TOKEN_KEY);
  await removeKey(BIOMETRICS_ENABLED);
  await removeKey(DUTY_TRACKING_ENABLED);
  await removeKey(THEME_MODE);

  await storage.deleteItem(USER_KEY);
}

export async function clearRefreshToken() {
  await removeKey(REFRESH_TOKEN_KEY);
}

export async function setUser(user: any) {
  await storage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser() {
  const raw = await storage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
