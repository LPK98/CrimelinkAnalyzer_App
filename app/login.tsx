import { images } from "@/src/constants/images";
import {
  clearRefreshToken,
  getRefreshToken,
  isBiometricsEnabled,
  setBiometricsEnabled as setBiometricsEnabledPref,
  setTokens,
} from "@/src/auth/auth";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { isAxiosError } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../src/hooks/useAuth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [isLogWithBiometrics, setIsLogWithBiometrics] = useState(false);
  const [isBiometricsSupported, setIsBiometricsSupported] = useState(false);
  const [isBiometricsEnrolled, setIsBiometricsEnrolled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [hasSavedRefreshToken, setHasSavedRefreshToken] = useState(false);
  const [autoBiometricAttempted, setAutoBiometricAttempted] = useState(false);

  const { login, loginWithRefreshToken, loading } = useAuth();

  const checkBiometricsSupport = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricsSupported(hasHardware);
      setIsBiometricsEnrolled(enrolled);

      const enabled = await isBiometricsEnabled();
      const refreshToken = await getRefreshToken();

      setBiometricsEnabled(enabled);
      setHasSavedRefreshToken(!!refreshToken);
    } catch (error) {
      console.log("Error checking biometric support:", error);
    }
  }, []);

  useEffect(() => {
    checkBiometricsSupport();
  }, [checkBiometricsSupport]);

  useFocusEffect(
    useCallback(() => {
      setError("");
      setIsLogWithBiometrics(false);
      setAutoBiometricAttempted(false);
      checkBiometricsSupport();
    }, [checkBiometricsSupport]),
  );

  useEffect(() => {
    if (autoBiometricAttempted) return;
    if (
      !isBiometricsSupported ||
      !isBiometricsEnrolled ||
      !biometricsEnabled ||
      !hasSavedRefreshToken ||
      loading
    ) {
      return;
    }

    setAutoBiometricAttempted(true);
    void handleBiometricLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autoBiometricAttempted,
    biometricsEnabled,
    hasSavedRefreshToken,
    isBiometricsEnrolled,
    isBiometricsSupported,
    loading,
  ]);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    let accessToken: string;
    let refreshToken: string | undefined;

    try {
      // Keep any existing biometric preference during normal login
      const res = await login(email, password, biometricsEnabled);
      accessToken = res.accessToken;
      refreshToken = res.refreshToken;
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
      return;
    }

    // Enable biometrics only when explicitly requested (first-time opt-in)
    if (isLogWithBiometrics && !biometricsEnabled) {
      if (!isBiometricsSupported) {
        Alert.alert(
          "Biometrics",
          "Biometric authentication is not supported on this device.",
        );
        setIsLogWithBiometrics(false);
      } else if (!isBiometricsEnrolled) {
        Alert.alert(
          "Biometrics",
          "No biometrics are enrolled on this device. Please set up Fingerprint/Face ID in device settings and try again.",
        );
        setIsLogWithBiometrics(false);
      } else {
      try {
        const saved = await LocalAuthentication.authenticateAsync({
          promptMessage: "Enable biometric login",
          fallbackLabel: "Use Passcode",
        });

        if (saved.success) {
          if (!refreshToken) {
            Alert.alert(
              "Biometrics",
              "Biometric login needs a refresh token from backend.",
            );
            await setBiometricsEnabledPref(false);
            await clearRefreshToken();
            setBiometricsEnabled(false);
            setHasSavedRefreshToken(false);
          } else {
            await setTokens(accessToken, refreshToken);
            await setBiometricsEnabledPref(true);
            setBiometricsEnabled(true);
            setHasSavedRefreshToken(true);
          }
        } else {
          setIsLogWithBiometrics(false);
        }
      } catch (error) {
        console.error("Error enabling biometrics:", error);
        setIsLogWithBiometrics(false);
        Alert.alert(
          "Biometrics",
          "Unable to enable biometric login on this device. You can still login with email/password.",
        );
      }
      }
    }

    router.replace("/Dashboard");
  };

  const handleBiometricLogin = async () => {
    setError("");

    if (!isBiometricsSupported) {
      setError("Biometric authentication is not supported on this device.");
      return;
    }

    if (!isBiometricsEnrolled) {
      setError(
        "No biometrics enrolled. Set up Fingerprint/Face ID in device settings.",
      );
      return;
    }

    if (!biometricsEnabled) {
      setError("Enable biometric login first (login once with the checkbox).");
      return;
    }

    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      setError("No saved session found. Please login manually.");
      return;
    }

    let res: LocalAuthentication.LocalAuthenticationResult;

    try {
      res = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login with Biometrics",
        fallbackLabel: "Use Passcode",
      });
    } catch (error) {
      console.error("Biometric prompt failed:", error);
      setError("Biometric authentication is unavailable on this device.");
      return;
    }

    if (!res.success) return;

    try {
      await loginWithRefreshToken(refreshToken);
    } catch (error) {
      console.error("Biometric login failed:", error);
      const status = isAxiosError(error) ? error.response?.status : null;

      if (status === 401) {
        setError("Session expired. Please login manually.");
        await setBiometricsEnabledPref(false);
        await clearRefreshToken();
        setBiometricsEnabled(false);
        setHasSavedRefreshToken(false);
        return;
      }

      const msg = status
        ? `Biometric login failed (HTTP ${status}). Please try again.`
        : "Biometric login failed. Check your connection and try again.";
      setError(msg);
    }
  };

  return (
    <ImageBackground
      source={images.bgApp}
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ opacity: 0.8 }}
    >
      {/* LOGO */}
      <Image source={images.logo} style={styles.logo} />
      {/* TITLE */}
      <Text style={styles.title}>Crime Link Analyzer</Text>
      <Text style={styles.subtitle}>Field Officer Secure Portal</Text>
      {/* LOGIN TEXT */}
      <Text style={styles.loginText}>Login to your account</Text>
      {!!error && (
        <Text className="text-red-600 text-center mb-3">{error}</Text>
      )}
      {/* USERNAME */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        placeholderTextColor="#cbd5e1"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />
      {/* PASSWORD */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        placeholderTextColor="#cbd5e1"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />
      {/* REMEMBER ME */}
      <View style={styles.rememberRow}>
        <TouchableOpacity
          style={[styles.checkbox, rememberMe && styles.checkboxActive]}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View
            className={`w-5 h-5 rounded border border-gray-400 items-center justify-center ${
              rememberMe ? "bg-black" : "bg-white"
            }`}
          >
            {rememberMe ? (
              <Ionicons name="checkmark" size={16} color="white" />
            ) : null}
          </View>
        </TouchableOpacity>
        <Text style={styles.rememberText}>Remember me</Text>
      </View>

      <View
        style={[
          styles.rememberRow,
          (!isBiometricsSupported || !isBiometricsEnrolled) && { marginBottom: 8 },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.checkbox,
            isLogWithBiometrics && styles.checkboxActive,
            (!isBiometricsSupported || !isBiometricsEnrolled) &&
              styles.checkboxDisabled,
          ]}
          onPress={() => {
            if (!isBiometricsSupported) {
              Alert.alert(
                "Biometrics",
                "Biometric authentication is not supported on this device.",
              );
              return;
            }

            if (!isBiometricsEnrolled) {
              Alert.alert(
                "Biometrics",
                "No biometrics are enrolled on this device. Please set up Fingerprint/Face ID in device settings and try again.",
              );
              return;
            }

            setIsLogWithBiometrics(!isLogWithBiometrics);
          }}
        >
            <View
              className={`w-5 h-5 rounded border border-gray-400 items-center justify-center ${
                isLogWithBiometrics ? "bg-black" : "bg-white"
              }`}
            >
              {isLogWithBiometrics ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : null}
            </View>
        </TouchableOpacity>
        <Text style={styles.rememberText}>Enable biometric login</Text>
      </View>
      {!isBiometricsSupported ? (
        <Text style={styles.biometricHint}>
          Biometric login is not available on this device.
        </Text>
      ) : !isBiometricsEnrolled ? (
        <Text style={styles.biometricHint}>
          Set up Fingerprint/Face ID in your device settings to enable biometric
          login.
        </Text>
      ) : null}

      {/* LOGIN BUTTON */}
      <TouchableOpacity
        disabled={loading}
        onPress={handleSubmit}
        style={styles.loginButton}
      >
        {loading ? (
          <View className="flex-row items-center">
            <ActivityIndicator color="white" />
            <Text
              style={styles.loginButtonText}
              // className="text-white font-semibold ml-2"
            >
              Logging in...
            </Text>
          </View>
        ) : (
          <Text className="text-white font-semibold">Login</Text>
        )}
      </TouchableOpacity>
      {/* FORGOT PASSWORD */}
      <Pressable
        disabled={loading}
        onPress={() => console.log("Fogot Password pressed")}
      >
        <Text style={styles.forgot}>Forgot Password</Text>
      </Pressable>
      {/* FINGERPRINT */}
      <TouchableOpacity
        disabled={loading}
        onPress={handleBiometricLogin}
        style={
          !isBiometricsSupported ||
          !isBiometricsEnrolled ||
          !biometricsEnabled ||
          !hasSavedRefreshToken
            ? { opacity: 0.45 }
            : undefined
        }
      >
        <Image source={images.fingerprint} style={styles.fingerprint} />
      </TouchableOpacity>
      {/* FOOTER */}
      <Text style={styles.footer}>
        Access to this system is restricted to authorized personnel of the Sri
        Lanka Crime Division only
      </Text>
      {/* END OF BACKGROUND IMAGE */}
      <View style={styles.overlay}></View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 80,
  },

  logo: {
    width: 70,
    height: 70,
    marginBottom: 20,
    resizeMode: "contain",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  subtitle: {
    color: "#cbd5f5",
    fontSize: 12,
    marginBottom: 40,
  },

  loginText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 25,
  },

  label: {
    alignSelf: "flex-start",
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
  },

  input: {
    width: "100%",
    height: 48,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 25,
    paddingHorizontal: 18,
    marginBottom: 18,
    color: "#000",
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 30,
  },

  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: "#e5e7eb",
    marginRight: 8,
  },

  checkboxActive: {
    backgroundColor: "#4f46e5",
  },

  checkboxDisabled: {
    opacity: 0.5,
  },

  rememberText: {
    color: "#fff",
    fontSize: 13,
  },

  biometricHint: {
    color: "#cbd5f5",
    fontSize: 12,
    alignSelf: "flex-start",
    marginBottom: 30,
  },

  loginButton: {
    backgroundColor: "#4f46e5",
    width: 120,
    height: 42,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  forgot: {
    color: "#e5e7eb",
    fontSize: 14,
    marginBottom: 30,
  },

  fingerprint: {
    width: 56,
    height: 56,
    marginBottom: 30,
    resizeMode: "contain",
  },

  footer: {
    color: "#cbd5f5",
    fontSize: 9,
    textAlign: "center",
    position: "absolute",
    bottom: 25,
    paddingHorizontal: 20,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)", // 0.6 = opacity
  },
});
