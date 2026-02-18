import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

type Store = {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  deleteItem: (key: string) => Promise<void>;
};

const memory = new Map<string, string>();
// let SecureStore: any = null;

// Lazy-require SecureStore only on native
// if (Platform.OS !== "web") {
//   SecureStore = require("expo-secure-store");
// } //REMOVE

export const storage: Store = {
  async setItem(key, value) {
    if (Platform.OS === "web") {
      // localStorage.setItem(key, value);
      memory.set(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key) {
    if (Platform.OS === "web") {
      // return localStorage.getItem(key);
      return memory.get(key) ?? null;
    }
    return await SecureStore.getItemAsync(key);
  },

  async deleteItem(key) {
    if (Platform.OS === "web") {
      // localStorage.removeItem(key);
      memory.delete(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
