import TopSectionTemplate from "@/src/components/TopSectionTemplate";
import OverlayButton from "@/src/components/UI/OverlayButton";
import Searchbar from "@/src/components/UI/Searchbar";
import { getCrimeLocations } from "@/src/services/safetyzoneService";
import { CrimeLocationType } from "@/src/types/SafetyzoneTypes";
import { Button } from "@react-navigation/elements";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const SRI_LANKA_BOUNDS = {
  northEast: {
    latitude: 9.85,
    longitude: 81.9,
  },
  southWest: {
    latitude: 5.85,
    longitude: 79.6,
  },
};

const SafetyZone = () => {
  const { width, height } = Dimensions.get("window");
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.05;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const isAnimatingRef = React.useRef(false);
  const mapRef = React.useRef<MapView>(null);
  const fullMapRef = React.useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [crimeLocations, setCrimeLocations] = useState<CrimeLocationType[]>([]);

  useEffect(() => {
    const loadLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Permission to access location was denied"); //OPTIONAL /FIX: handle permission denial or show alert
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
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const locations = await getCrimeLocations();
      setCrimeLocations(locations);
      // console.log(locations); //REMOVE :TEST
    } catch (error) {
      console.log(error);
    }
  };

  const onMapReady = async (ref: React.RefObject<MapView | null>) => {
    if (!ref.current) return;

    await ref.current.setMapBoundaries(
      SRI_LANKA_BOUNDS.northEast,
      SRI_LANKA_BOUNDS.southWest,
    );
  };

  const animateTo = (next: Region, duration = 300) => {
    isAnimatingRef.current = true;
    setRegion(next);

    const activeRef = isFullScreen ? fullMapRef : mapRef;
    activeRef.current?.animateToRegion(next, duration);

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, duration + 50);
  };

  const zoom = (direction: "in" | "out") => {
    if (!region) return;

    const zoomFactor = direction === "in" ? 0.5 : 2;

    const newRegin: Region = {
      ...region,
      latitudeDelta: region.latitudeDelta * zoomFactor,
      longitudeDelta: region.longitudeDelta * zoomFactor,
    };

    animateTo(newRegin, 250);
  };

  const myLocation = async () => {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const nextRegion: Region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: region?.latitudeDelta ?? LATITUDE_DELTA,
      longitudeDelta: region?.longitudeDelta ?? LONGITUDE_DELTA,
    };

    animateTo(nextRegion, 350);
  };

  const sameRegion = (a: Region, b: Region) => {
    const eps = 0.00001;
    const deps = 0.00001;
    return (
      Math.abs(a.latitude - b.latitude) < eps &&
      Math.abs(a.longitude - b.longitude) < eps &&
      Math.abs(a.latitudeDelta - b.latitudeDelta) < deps &&
      Math.abs(a.longitudeDelta - b.longitudeDelta) < deps
    );
  }; //FIX

  if (!region) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopSectionTemplate subHeading="Safety Zone Mapping">
        <Searchbar />
        {/* REMOVE */}
        <Button
          onPress={() => {
            router.replace("/Dashboard");
          }}
        >
          Back
        </Button>
        <Button onPress={fetchLocations}>test</Button>
        {/* REMOVE */}
        <View
          style={{
            flex: 1,
            // height: Dimensions.get("window").height * 0.5, //REMOVE : this or flex:1
            width: "100%",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: "white",
              fontWeight: "bold",
              elevation: 11,
            }}
          >
            Safety Zone Map
          </Text>
          <View
            style={{
              flex: 1,
              margin: isFullScreen ? 0 : 10,
              borderRadius: isFullScreen ? 0 : 20,
              overflow: "hidden",
            }}
          >
            <MapView
              ref={mapRef}
              style={{ flex: 1, height: "100%", width: "100%" }}
              provider="google"
              region={region}
              onMapReady={() => onMapReady(mapRef)}
              onRegionChangeComplete={(region) => {
                if (isAnimatingRef.current) return;
                setRegion(region);
              }}
              showsUserLocation={true}
              showsMyLocationButton={false}
              minZoomLevel={6}
              maxZoomLevel={18}
              // initialRegion={{
              //   latitude: 5.948202,
              //   longitude: 80.548086,
              //   latitudeDelta: LATITUDE_DELTA,
              //   longitudeDelta: LONGITUDE_DELTA,
              // }} //REMOVE
            >
              {crimeLocations.map((loc, index) => (
                <Marker
                  key={loc.id ?? `${loc.latitude}-${loc.longitude}-${index}`}
                  coordinate={{
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                  }}
                  title={loc.crimeType}
                />
              ))}
            </MapView>
            {/* Overlay buttons */}
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                gap: 10,
                zIndex: 999,
                elevation: 999,
              }}
              pointerEvents="box-none"
            >
              <OverlayButton
                icon="fullscreen"
                iconColor="#ffffff"
                size={24}
                onPress={() => setIsFullScreen((v) => !v)}
              />
              <OverlayButton icon="add" size={24} onPress={() => zoom("in")} />
              <OverlayButton
                icon="remove"
                size={24}
                onPress={() => zoom("out")}
              />
              <OverlayButton
                icon="my-location"
                size={24}
                onPress={myLocation}
              />
            </View>
          </View>
        </View>
        {/* Legend cards */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 10,
          }}
        >
          <View
            style={{
              borderRadius: 50,
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: "#103735",
              borderColor: "#0F5849",
              borderWidth: 3,
            }}
          >
            <Text style={{ color: "#2EBD8B", fontWeight: 600 }}>Safe Zone</Text>
          </View>
          <View
            style={{
              borderRadius: 50,
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: "#373310",
              borderColor: "#EAB308",
              borderWidth: 3,
            }}
          >
            <Text style={{ color: "#EAB308", fontWeight: 600 }}>Caution</Text>
          </View>
          <View
            style={{
              borderRadius: 50,
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: "#3F1F1F",
              borderColor: "#641D1D",
              borderWidth: 3,
            }}
          >
            <Text style={{ color: "#FB3C3C", fontWeight: 600 }}>High Risk</Text>
          </View>
          <View
            style={{
              borderRadius: 50,
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: "#212937",
              borderColor: "#323D4E",
              borderWidth: 3,
            }}
          >
            <Text style={{ color: "#93A2B7", fontWeight: 600 }}>No data</Text>
          </View>
        </View>
      </TopSectionTemplate>

      {isFullScreen && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            elevation: 9999,
            backgroundColor: "#0B0C1A",
          }}
          pointerEvents="auto"
        >
          <MapView
            style={{ flex: 1 }}
            provider="google"
            region={region}
            onMapReady={() => onMapReady(fullMapRef)}
            onRegionChangeComplete={(r) => {
              if (!region || !sameRegion(region, r)) setRegion(r);
            }} //FIX: map auto minimizing when fullscreen
            showsUserLocation
            showsMyLocationButton={false}
          >
            {crimeLocations.map((loc, index) => (
              <Marker
                key={loc.id ?? `${loc.latitude}-${loc.longitude}-${index}`}
                coordinate={{
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }}
                title={loc.crimeType}
              />
            ))}
          </MapView>

          <View
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10000,
              elevation: 10000,
              gap: 10,
            }}
            pointerEvents="auto"
          >
            <OverlayButton
              icon="fullscreen-exit"
              size={24}
              onPress={() => setIsFullScreen(false)}
            />
            <OverlayButton icon="add" size={24} onPress={() => zoom("in")} />
            <OverlayButton
              icon="remove"
              size={24}
              onPress={() => zoom("out")}
            />
            <OverlayButton icon="my-location" size={24} onPress={myLocation} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};
export default SafetyZone;
