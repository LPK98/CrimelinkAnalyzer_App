import { storage } from "./storage";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";

export async function setTokens(accessToken: string, refreshToken?: string) {
  await storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function getAccessToken() {
  return storage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return storage.getItem(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await storage.deleteItem(ACCESS_TOKEN_KEY);
  await storage.deleteItem(REFRESH_TOKEN_KEY);
  await storage.deleteItem(USER_KEY);
}

export async function setUser(user: any) {
  await storage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser() {
  const raw = await storage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
