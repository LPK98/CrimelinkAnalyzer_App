# CrimeLink Analyzer Mobile App

React Native + Expo mobile client for the CrimeLink Analyzer platform.

This app connects to:

- CrimeLink backend APIs (authentication, duty, leave, announcements, safety zones, weapon requests, officer location)
- Firebase (chat/auth-related integrations)
- Google Maps services (map and location features)

## Tech stack

- Expo SDK 54
- React Native 0.81
- Expo Router (file-based routing)
- TypeScript
- NativeWind
- Axios
- Firebase

## Prerequisites

Install the following before running:

- Node.js 18+ (recommended: latest LTS)
- npm 9+
- Expo CLI (via npx, no global install required)
- Android Studio (for Android emulator) or Xcode (for iOS simulator on macOS)

For API calls to work, run the backend service and make sure its URL is reachable from your device/emulator.

## Environment configuration

This project reads environment values from:

- `.env.development`
- `.env.preview`
- `.env.production`

The selected file depends on `APP_ENV` (default is `development`).

### 1. Create your env file

From this folder, copy `.env.example` to one of the environment files:

```bash
cp .env.example .env.development
```

### 2. Fill required values

At minimum, set all of the following keys:

```env
API_URL=
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

Optional but recommended:

```env
GOOGLE_MAPS_API_KEY=
```

### API_URL tips

- Android emulator (calling backend on your machine):

```env
API_URL=http://10.0.2.2:8080
```

- iOS simulator:

```env
API_URL=http://localhost:8080
```

- Physical device (same Wi-Fi as your machine):

```env
API_URL=http://<YOUR_LOCAL_IP>:8080
```

## Install dependencies

```bash
npm install
```

## Run the app

### Start Expo dev server

Development environment (default):

```bash
npx expo start
```

Use a specific environment file:

```bash
APP_ENV=preview npx expo start
APP_ENV=production npx expo start
```

### Run on Android

```bash
npm run android
```

### Run on iOS (macOS only)

```bash
npm run ios
```

### Run on web

```bash
npm run web
```

## Lint

```bash
npm run lint
```

## Typical local workflow

1. Start backend service (default expected port: 8080).
2. Configure `.env.development` with valid API/Firebase values.
3. Install dependencies with `npm install`.
4. Start Expo using `npx expo start`.
5. Launch on emulator/device (`a` for Android, `i` for iOS in Expo terminal, or use npm scripts).

## Build and deployment notes

- App config values are injected through `app.config.js` into Expo `extra`.
- If you use EAS Build, define the same env vars in your EAS environment. Missing values can cause runtime failures when reading config.

## Project structure

- `app/` route screens (Expo Router)
- `src/api/` API client setup
- `src/services/` feature service layers
- `src/constants/` shared constants and runtime config
- `src/components/` reusable UI and feature components
- `src/context/` and `src/hooks/` app state and hooks

## Troubleshooting

- Error: Missing required app config
  - Check `.env.*` values and confirm you started the app with the intended `APP_ENV`.
- Network request failed
  - Verify backend is running and `API_URL` is reachable from emulator/device.
- Android physical device cannot reach backend
  - Use your machine local IP address, not `localhost`.

## Useful scripts

- `npx expo start` - Start Expo development server
- `npm run android` - Build/run on Android
- `npm run ios` - Build/run on iOS
- `npm run web` - Run web target
- `npm run lint` - Lint project
- `npm run reset-project` - Reset scaffolded starter structure
