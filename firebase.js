import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./src/constants/appConfig";

// Initialize Firebase only if no app exists
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export services
export const auth =
  getApps().length > 1
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
