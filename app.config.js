import "dotenv/config";

const ENV = process.env.APP_ENV ?? "development";

const envFiles = {
  development: ".env.development",
  preview: ".env.preview",
  production: ".env.production",
};

require("dotenv").config({ path: envFiles[ENV] });

const appName =
  ENV === "production" ? "CrimelinkAnalyzer" : `CrimelinkAnalyzer (${ENV})`;

export default {
  expo: {
    name: appName,
    slug: "CrimelinkAnalyzer_app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "crimelinkanalyzerapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "This app uses your location to show nearby places and reports.",
        NSFaceIDUsageDescription:
          "Allow Crime Link Analyzer to use Face ID to authenticate you.",
      },
    },

    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/logo.png",
        backgroundImage: "./assets/images/logo.png",
        monochromeImage: "./assets/images/logo.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ["ACCESS_FINE_LOCATION"],
      package: "com.anonymous.CrimelinkAnalyzer_app",
      jsEngine: "hermes",
    },

    web: {
      output: "static",
      favicon: "./assets/images/logo.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-secure-store",
      "expo-sqlite",
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    extra: {
      router: {},
      eas: {
        projectId: "ab5e7b7b-eb2e-49f5-9a61-01529d4cae27",
      },
      appEnv: ENV,
      apiUrl: process.env.API_URL,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
  },
};
