import TopSectionTemplate from "@/src/components/TopSectionTemplate";
import Searchbar from "@/src/components/UI/Searchbar";
import { Button } from "@react-navigation/elements";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import MapView, { Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const SafetyZone = () => {
  const { width, height } = Dimensions.get("window");
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.05;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    const loadLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    };

    loadLocation();
  }, []);

  if (!region) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <SafeAreaView>
      <TopSectionTemplate
        heading="Crime Link Analyzer"
        subHeading="Safety Zone Mapping"
      >
        <Searchbar />
        <Button
          onPress={() => {
            router.replace("/Dashboard");
          }}
        >
          Back
        </Button>
      </TopSectionTemplate>
      <View>
        <Text>Safety Zone Map</Text>
        <MapView
          style={{ height: "100%", width: "100%" }}
          provider="google"
          // initialRegion={{
          //   latitude: 5.948202,
          //   longitude: 80.548086,
          //   latitudeDelta: LATITUDE_DELTA,
          //   longitudeDelta: LONGITUDE_DELTA,
          // }}
          region={region}
        />
      </View>
    </SafeAreaView>
  );
};

export default SafetyZone;
