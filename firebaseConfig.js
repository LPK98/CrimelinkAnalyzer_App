/**
 * Firebase Configuration
 *
 * INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new Firebase project (or use an existing one)
 * 3. Enable Email/Password Authentication:
 *    - Go to Authentication > Sign-in method > Email/Password > Enable
 * 4. Create a Firestore Database:
 *    - Go to Firestore Database > Create Database > Start in test mode
 * 5. Get your web app config:
 *    - Go to Project Settings > General > Your apps > Web app
 *    - Copy the firebaseConfig object and paste it below
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace these placeholder values with your actual Firebase project config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore database
const db = getFirestore(app);

// Initialize Firebase Storage for media uploads
const storage = getStorage(app);

export { auth, db, storage };
export default app;
