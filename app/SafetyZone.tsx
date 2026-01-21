import React from "react";
import { Text, View } from "react-native";
import MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const SafetyZone = () => {
  return (
    <SafeAreaView>
      <Text>SafetyZone</Text>
      <View>
        <MapView style={{ height: "100%", width: "100%" }} />
      </View>
    </SafeAreaView>
  );
};

export default SafetyZone;
