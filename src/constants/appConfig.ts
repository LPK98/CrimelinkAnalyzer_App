import Constants from "expo-constants";

type ExpoExtra = {
  apiUrl?: string;
  googleMapsApiKey?: string;
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

const requireConfig = (value: string | undefined, key: keyof ExpoExtra) => {
  if (!value) {
    throw new Error(
      `Missing required app config: ${String(key)}. Check app.config.js extra and .env.* files.`,
    );
  }
  return value;
};

export const appConfig = {
  apiUrl: requireConfig(extra.apiUrl, "apiUrl"),
  googleMapsApiKey: extra.googleMapsApiKey,
  firebaseApiKey: requireConfig(extra.firebaseApiKey, "firebaseApiKey"),
  firebaseAuthDomain: requireConfig(
    extra.firebaseAuthDomain,
    "firebaseAuthDomain",
  ),
  firebaseProjectId: requireConfig(
    extra.firebaseProjectId,
    "firebaseProjectId",
  ),
  firebaseStorageBucket: requireConfig(
    extra.firebaseStorageBucket,
    "firebaseStorageBucket",
  ),
  firebaseMessagingSenderId: requireConfig(
    extra.firebaseMessagingSenderId,
    "firebaseMessagingSenderId",
  ),
  firebaseAppId: requireConfig(extra.firebaseAppId, "firebaseAppId"),
};

export const firebaseConfig = {
  apiKey: appConfig.firebaseApiKey,
  authDomain: appConfig.firebaseAuthDomain,
  projectId: appConfig.firebaseProjectId,
  storageBucket: appConfig.firebaseStorageBucket,
  messagingSenderId: appConfig.firebaseMessagingSenderId,
  appId: appConfig.firebaseAppId,
};
