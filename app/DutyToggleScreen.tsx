import { isDutyTrackingEnabled, setDutyTrackingEnabled } from "@/src/auth/auth";
import { initLocationDB } from "@/src/services/location/locationDB";
import {
  startTracking,
  stopTracking,
} from "@/src/services/location/locationTracker";
import { useTheme } from "@/src/theme/ThemeProvider";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Switch, Text, View } from "react-native";

type DutyToggleScreenProps = {
  onDutyStatusChange?: (isOnDuty: boolean) => void;
};

export default function DutyToggleScreen({
  onDutyStatusChange,
}: DutyToggleScreenProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [isDutyStatusLoading, setIsDutyStatusLoading] = useState(true);
  const [isUpdatingDutyStatus, setIsUpdatingDutyStatus] = useState(false);

  useEffect(() => {
    initLocationDB();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDutyStatus = async () => {
      try {
        const savedDutyStatus = await isDutyTrackingEnabled();
        if (!isMounted) return;

        setIsOnDuty(savedDutyStatus);
        onDutyStatusChange?.(savedDutyStatus);
      } catch (error) {
        console.error("Failed to load duty tracking status:", error);
        if (!isMounted) return;

        setIsOnDuty(false);
        onDutyStatusChange?.(false);
      } finally {
        if (!isMounted) return;
        setIsDutyStatusLoading(false);
      }
    };

    loadDutyStatus();

    return () => {
      isMounted = false;
    };
  }, [onDutyStatusChange]);

  const toggleDuty = async (v: boolean) => {
    if (isDutyStatusLoading || isUpdatingDutyStatus) return;

    const previousValue = isOnDuty;

    try {
      setIsUpdatingDutyStatus(true);

      if (v) {
        await startTracking();
      } else {
        await stopTracking();
      }

      try {
        await setDutyTrackingEnabled(v);
      } catch (saveError) {
        if (previousValue !== v) {
          if (previousValue) {
            await startTracking();
          } else {
            await stopTracking();
          }
        }
        throw saveError;
      }

      setIsOnDuty(v);
      onDutyStatusChange?.(v);
    } catch (error) {
      console.error("Failed to update duty tracking status:", error);
      Alert.alert(
        "Duty Status",
        v
          ? "Unable to turn on duty tracking. Please check location permissions and try again."
          : "Unable to turn off duty tracking. Please try again.",
      );
    } finally {
      setIsUpdatingDutyStatus(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ color: colors.text }}>Status : </Text>
        <Text
          style={
            isOnDuty
              ? { color: "green", fontWeight: "bold" }
              : { color: "red", fontWeight: "bold" }
          }
        >
          {isOnDuty ? "On" : "Off"}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text style={{ fontSize: 16, marginBottom: 10, color: colors.text }}>
          Are you currently on duty?
        </Text>
        <Switch
          value={isOnDuty}
          onValueChange={toggleDuty}
          disabled={isDutyStatusLoading || isUpdatingDutyStatus}
        />
      </View>
      <Text style={{ fontSize: 14, marginBottom: 10, color: colors.text }}>
        Toggle your duty status. When on duty, your location will be tracked for
        safety and operational purposes.
      </Text>
    </View>
  );
}
