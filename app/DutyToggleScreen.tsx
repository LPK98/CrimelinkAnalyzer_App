import { View, Text, Switch } from "react-native";
import React, { useEffect, useState } from "react";
import { initLocationDB } from "@/src/services/location/locationDB";
import {
  startTracking,
  stopTracking,
} from "@/src/services/location/locationTracker";

export default function DutyToggleScreen() {
  const [isOnDuty, setIsOnDuty] = useState(false);

  useEffect(() => {
    initLocationDB();
  }, []);

  const toggleDuty = async (v: boolean) => {
    setIsOnDuty(v);
    if (v) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>On Duty Tracking</Text>
      <Switch value={isOnDuty} onValueChange={toggleDuty} />
      <Text style={{ marginTop: 10 }}>Status : {isOnDuty ? "On" : "Off"}</Text>
    </View>
  );
}
