import {
  isBiometricsEnabled,
  isDutyTrackingEnabled as isDutyTrackingEnabledPref,
  setBiometricsEnabled as setBiometricsEnabledPref,
} from "@/src/auth/auth";
import ThemeToggle from "@/src/components/ThemeToggle";
import { images } from "@/src/constants/images";
import { useTheme } from "@/src/theme/ThemeProvider";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Switch } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import DutyToggleScreen from "./DutyToggleScreen";

export default function Settings() {
  const { colors } = useTheme();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isPrefLoading, setIsPrefLoading] = useState(true);
  const [isUpdatingBiometricPref, setIsUpdatingBiometricPref] = useState(false);
  const [isDutyStatusLoading, setIsDutyStatusLoading] = useState(true);
  const [isDutyTrackingEnabled, setIsDutyTrackingEnabled] = useState(false);

  const loadBiometricState = useCallback(async () => {
    try {
      setIsPrefLoading(true);
      const [hasHardware, isEnrolled, isEnabled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        isBiometricsEnabled(),
      ]);

      setIsBiometricSupported(hasHardware);
      setIsBiometricEnrolled(isEnrolled);
      setIsBiometricEnabled(isEnabled);
    } catch (error) {
      console.error("Failed to load biometric settings:", error);
      setIsBiometricEnabled(false);
    } finally {
      setIsPrefLoading(false);
    }
  }, []);

  const loadDutyStatus = useCallback(async () => {
    try {
      setIsDutyStatusLoading(true);
      const isEnabled = await isDutyTrackingEnabledPref();
      setIsDutyTrackingEnabled(isEnabled);
    } catch (error) {
      console.error("Failed to load duty tracking status:", error);
      setIsDutyTrackingEnabled(false);
    } finally {
      setIsDutyStatusLoading(false);
    }
  }, []);

  const handleDutyStatusChange = useCallback((isOnDuty: boolean) => {
    setIsDutyTrackingEnabled(isOnDuty);
    setIsDutyStatusLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBiometricState();
      loadDutyStatus();
    }, [loadBiometricState, loadDutyStatus]),
  );

  const handleBiometricToggle = async (nextValue: boolean) => {
    if (isUpdatingBiometricPref) return;

    if (!nextValue) {
      try {
        setIsUpdatingBiometricPref(true);
        await setBiometricsEnabledPref(false);
        setIsBiometricEnabled(false);
        Alert.alert("Biometrics", "Biometric login disabled.");
      } catch (error) {
        console.error("Failed to disable biometric login:", error);
        Alert.alert("Biometrics", "Unable to update biometric preference.");
      } finally {
        setIsUpdatingBiometricPref(false);
      }
      return;
    }

    try {
      setIsUpdatingBiometricPref(true);

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setIsBiometricSupported(false);
        Alert.alert(
          "Biometrics",
          "Biometric authentication is not supported on this device.",
        );
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setIsBiometricEnrolled(false);
        Alert.alert(
          "Biometrics",
          "No biometrics are enrolled on this device. Please set up Fingerprint/Face ID in device settings and try again.",
        );
        return;
      }

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: "Enable biometric login",
        fallbackLabel: "Use Passcode",
      });

      if (!authResult.success) {
        return;
      }

      await setBiometricsEnabledPref(true);
      setIsBiometricSupported(true);
      setIsBiometricEnrolled(true);
      setIsBiometricEnabled(true);
      Alert.alert("Biometrics", "Biometric login enabled.");
    } catch (error) {
      console.error("Failed to enable biometric login:", error);
      Alert.alert(
        "Biometrics",
        "Unable to enable biometric login on this device.",
      );
    } finally {
      setIsUpdatingBiometricPref(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        style={styles.bg}
        source={images.bgApp}
        resizeMode="cover"
      >
        <View style={[styles.container, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.headerCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              onPress={() =>
                router.canGoBack() ? router.back() : router.push("/Dashboard")
              }
              style={[
                styles.backButton,
                {
                  backgroundColor: colors.iconSurface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.headerTextWrap}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Settings
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text }]}>
                Personalize app behavior and security preferences
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Duty Status
              </Text>

              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: colors.text }]}>
                  Current
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: isDutyStatusLoading
                        ? colors.iconSurface
                        : isDutyTrackingEnabled
                          ? "rgba(22,163,74,0.18)"
                          : "rgba(220,38,38,0.18)",
                      borderColor: isDutyStatusLoading
                        ? colors.border
                        : isDutyTrackingEnabled
                          ? "rgba(22,163,74,0.45)"
                          : "rgba(220,38,38,0.45)",
                    },
                  ]}
                >
                  <Text
                    style={
                      isDutyStatusLoading
                        ? [styles.statusPillText, { color: colors.text }]
                        : isDutyTrackingEnabled
                          ? [styles.statusPillText, { color: "#16A34A" }]
                          : [styles.statusPillText, { color: colors.danger }]
                    }
                  >
                    {isDutyStatusLoading
                      ? "Checking..."
                      : isDutyTrackingEnabled
                        ? "On"
                        : "Off"}
                  </Text>
                </View>
              </View>

              <DutyToggleScreen onDutyStatusChange={handleDutyStatusChange} />
            </View>

            <View
              style={[
                styles.sectionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Theme Mode
              </Text>
              <ThemeToggle />
            </View>

            <View
              style={[
                styles.sectionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Biometric Login
              </Text>

              <View style={styles.bioRow}>
                <Text style={[styles.bioStatusText, { color: colors.text }]}>
                  {isPrefLoading
                    ? "Checking..."
                    : isBiometricEnabled
                      ? "Enabled"
                      : "Disabled"}
                </Text>
                <Switch
                  value={isBiometricEnabled}
                  onValueChange={handleBiometricToggle}
                  disabled={isPrefLoading || isUpdatingBiometricPref}
                  color={colors.primary}
                />
              </View>

              {!isBiometricSupported ? (
                <Text style={[styles.helperText, { color: colors.text }]}>
                  Biometric authentication is not supported on this device.
                </Text>
              ) : !isBiometricEnrolled ? (
                <Text style={[styles.helperText, { color: colors.text }]}>
                  Set up Fingerprint/Face ID in device settings to enable this
                  option.
                </Text>
              ) : (
                <Text style={[styles.helperText, { color: colors.text }]}>
                  Use Face ID or Fingerprint to quickly and securely sign in.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  headerCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    opacity: 0.75,
  },
  scroll: {
    flex: 1,
    marginTop: 14,
  },
  scrollContent: {
    paddingBottom: 28,
    gap: 12,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  bioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  bioStatusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
  },
});
