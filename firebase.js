import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUTM7T4PU0wZP2Qs5nWIGNM5D1wrWE0-o",
  authDomain: "chatapp-3b437.firebaseapp.com",
  projectId: "chatapp-3b437",
  storageBucket: "chatapp-3b437.firebasestorage.app",
  messagingSenderId: "822724763822",
  appId: "1:822724763822:web:3ed2eb039b703b00dacd3f"
};

// Initialize Firebase only if no app exists
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;