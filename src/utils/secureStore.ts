import * as SecureStore from "expo-secure-store";

export async function saveBoolToPrefs(key: string, value: boolean) {
  await SecureStore.setItemAsync(key, value ? "1" : "0");
}

export async function getBoolFromPrefs(key: string) {
  const res = await SecureStore.getItemAsync(key);
  return res === "1";
}

export async function saveStringToPrefs(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

export async function getStringFromPrefs(key: string) {
  return await SecureStore.getItemAsync(key);
}

export async function removeKey(key: string) {
  await SecureStore.deleteItemAsync(key);
}
