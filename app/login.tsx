import {
  clearRefreshToken,
  getRefreshToken,
  isBiometricsEnabled,
  setBiometricsEnabled as setBiometricsEnabledPref,
} from "@/src/auth/auth";
import { images } from "@/src/constants/images";
import { Theme } from "@/src/theme/theme";
import { useTheme } from "@/src/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { isAxiosError } from "axios";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../src/hooks/useAuth";

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [isBiometricsSupported, setIsBiometricsSupported] = useState(false);
  const [isBiometricsEnrolled, setIsBiometricsEnrolled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [hasSavedRefreshToken, setHasSavedRefreshToken] = useState(false);

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
      checkBiometricsSupport();
    }, [checkBiometricsSupport]),
  );

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      await login(email, password, biometricsEnabled);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
      return;
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
      setError("Enable biometric login from Settings first.");
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
      imageStyle={{ opacity: 1 }}
    >
      <View style={styles.overlay}>
        {/* LOGO */}
        <Image source={images.logo} style={styles.logo} />
        {/* TITLE */}
        <Text style={styles.title}>Crime Link Analyzer</Text>
        <Text style={styles.subtitle}>Field Officer Secure Portal</Text>
        {/* LOGIN TEXT */}
        <Text style={styles.loginText}>Login to your account</Text>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {/* USERNAME */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          placeholderTextColor={colors.sidebarItemMutedText}
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
          placeholderTextColor={colors.sidebarItemMutedText}
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
              style={[
                styles.checkboxInner,
                rememberMe
                  ? styles.checkboxInnerChecked
                  : styles.checkboxInnerUnchecked,
              ]}
            >
              {rememberMe ? (
                <Ionicons name="checkmark" size={16} color={colors.white} />
              ) : null}
            </View>
          </TouchableOpacity>
          <Text style={styles.rememberText}>Remember me</Text>
        </View>

        {!isBiometricsSupported ? (
          <Text style={styles.biometricHint}>
            Biometric login is not available on this device.
          </Text>
        ) : !isBiometricsEnrolled ? (
          <Text style={styles.biometricHint}>
            Set up Fingerprint/Face ID in your device settings to enable
            biometric login.
          </Text>
        ) : null}

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleSubmit}
          style={styles.loginButton}
        >
          {loading ? (
            <View style={styles.loginButtonLoadingRow}>
              <ActivityIndicator color={colors.white} />
              <Text style={[styles.loginButtonText, styles.loadingButtonText]}>
                Logging in...
              </Text>
            </View>
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        {/* FORGOT PASSWORD */}
        <Pressable
          disabled={loading}
          onPress={() =>
            alert("Please contact your administrator to reset your password.")
          }
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
          <Ionicons name="finger-print-sharp" color={colors.white} size={50} />
        </TouchableOpacity>
        {/* FOOTER */}
        <Text style={styles.footer}>
          Access to this system is restricted to authorized personnel of the Sri
          Lanka Crime Division only
        </Text>
      </View>
    </ImageBackground>
  );
}

const createStyles = (colors: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    overlay: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 30,
      paddingTop: 100,
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },

    logo: {
      width: 80,
      height: 80,
      marginBottom: 20,
      resizeMode: "contain",
    },

    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.white,
      textAlign: "center",
    },

    subtitle: {
      color: colors.primaryAccent,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 40,
    },

    loginText: {
      color: colors.white,
      fontSize: 18,
      marginBottom: 25,
    },

    errorText: {
      color: colors.danger,
      textAlign: "center",
      marginBottom: 12,
    },

    label: {
      alignSelf: "flex-start",
      color: colors.white,
      fontSize: 14,
      marginBottom: 6,
    },

    input: {
      width: "100%",
      height: 48,
      backgroundColor: colors.white,
      borderRadius: 25,
      paddingHorizontal: 18,
      marginBottom: 18,
      color: colors.black,
    },

    rememberRow: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      marginBottom: 38,
    },

    checkbox: {
      width: 14,
      height: 14,
      borderRadius: 3,
      backgroundColor: colors.border,
      marginRight: 8,
      alignItems: "center",
      justifyContent: "center",
    },

    checkboxActive: {
      backgroundColor: colors.secondary,
    },

    checkboxInner: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    checkboxInnerChecked: {
      backgroundColor: colors.text,
    },

    checkboxInnerUnchecked: {
      backgroundColor: colors.white,
    },

    rememberText: {
      color: colors.white,
      fontSize: 13,
    },

    biometricHint: {
      color: colors.primaryAccent,
      fontSize: 12,
      alignSelf: "flex-start",
      marginBottom: 30,
    },

    loginButton: {
      backgroundColor: colors.secondary,
      width: 120,
      height: 42,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },

    loginButtonLoadingRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    loadingButtonText: {
      marginLeft: 8,
    },

    loginButtonText: {
      color: colors.white,
      fontWeight: "bold",
      fontSize: 18,
    },

    forgot: {
      color: colors.sidebarItemMutedText,
      fontSize: 14,
      marginBottom: 30,
    },

    fingerprint: {
      width: 60,
      height: 60,
      marginBottom: 30,
      resizeMode: "contain",
    },

    footer: {
      color: colors.primaryAccent,
      fontSize: 9,
      textAlign: "center",
      position: "absolute",
      bottom: 25,
      paddingHorizontal: 20,
    },
  });
