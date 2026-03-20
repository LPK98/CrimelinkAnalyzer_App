import {
  isBiometricsEnabled,
  isDutyTrackingEnabled as isDutyTrackingEnabledPref,
  setBiometricsEnabled as setBiometricsEnabledPref,
} from "@/src/auth/auth";
import ThemeToggle from "@/src/components/ThemeToggle";
import { useTheme } from "@/src/theme/ThemeProvider";
import { useFocusEffect } from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Switch } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import DutyToggleScreen from "./DutyToggleScreen";

export default function Settings() {
  const { t } = useTranslation();
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
    <SafeAreaView
      style={{
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        gap: 20,
        backgroundColor: colors.background,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity
          onPress={() => router.replace("/Dashboard")}
          className="p-1"
        >
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "bold" }}>
          Settings
        </Text>
      </View>
      <View>
        <Text
          style={{
            fontSize: 18,
            marginBottom: 10,
            fontWeight: "bold",
            color: colors.text,
          }}
        >
          Duty Status
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 14 }}>Current:</Text>
          <Text
            style={
              isDutyStatusLoading
                ? { color: colors.text, fontWeight: "bold" }
                : isDutyTrackingEnabled
                  ? { color: "green", fontWeight: "bold" }
                  : { color: "red", fontWeight: "bold" }
            }
          >
            {isDutyStatusLoading
              ? "Checking..."
              : isDutyTrackingEnabled
                ? "On"
                : "Off"}
          </Text>
        </View>
        <DutyToggleScreen onDutyStatusChange={handleDutyStatusChange} />
      </View>

      <View style={{ gap: 10, marginBottom: 14 }}>
        <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 18 }}>
          Theme Mode
        </Text>
        <ThemeToggle />
      </View>

      <View style={{ gap: 10, marginBottom: 14 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>
          Enable biometric Login
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 10,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.text }}>
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
          />
        </View>
        {!isBiometricSupported ? (
          <Text style={{ fontSize: 12, color: colors.text }}>
            Biometric authentication is not supported on this device.
          </Text>
        ) : !isBiometricEnrolled ? (
          <Text style={{ fontSize: 12, color: colors.text }}>
            Set up Fingerprint/Face ID in device settings to enable this option.
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
