import OverlayButton from "@/src/components/UI/OverlayButton";
import Searchbar from "@/src/components/UI/Searchbar";
import { images } from "@/src/constants/images";
import { getCrimeLocations } from "@/src/services/safetyzoneService";
import { useTheme } from "@/src/theme/ThemeProvider";
import { CrimeLocationType } from "@/src/types/SafetyzoneTypes";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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

const { width: BASE_SCREEN_WIDTH, height: BASE_SCREEN_HEIGHT } =
  Dimensions.get("window");
const BASE_ASPECT_RATIO = BASE_SCREEN_WIDTH / BASE_SCREEN_HEIGHT;
const LATITUDE_DELTA = 0.05;
const LONGITUDE_DELTA = LATITUDE_DELTA * BASE_ASPECT_RATIO;

const LEGEND_ITEMS = [
  {
    id: "safe",
    label: "Safe Zone",
    chipBg: "#103735",
    chipBorder: "#0F5849",
    chipText: "#2EBD8B",
  },
  {
    id: "caution",
    label: "Caution",
    chipBg: "#373310",
    chipBorder: "#EAB308",
    chipText: "#EAB308",
  },
  {
    id: "risk",
    label: "High Risk",
    chipBg: "#3F1F1F",
    chipBorder: "#641D1D",
    chipText: "#FB3C3C",
  },
  {
    id: "nodata",
    label: "No Data",
    chipBg: "#212937",
    chipBorder: "#323D4E",
    chipText: "#93A2B7",
  },
] as const;

const SafetyZone = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isCompact = windowWidth < 390;
  const mapHeight = Math.max(
    260,
    Math.min(windowHeight * (isCompact ? 0.38 : 0.44), 420),
  );

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

    const newRegion: Region = {
      ...region,
      latitudeDelta: region.latitudeDelta * zoomFactor,
      longitudeDelta: region.longitudeDelta * zoomFactor,
    };

    animateTo(newRegion, 250);
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
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size={"large"} color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        style={styles.background}
        source={images.bgApp}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.overlay,
            },
          ]}
        >
          <View
            style={[
              styles.headerCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Pressable
              onPress={() => router.replace("/Dashboard")}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </Pressable>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Safety Zone
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text }]}>
                Real-time mapping and incident hotspots
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.searchCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Searchbar />
          </View>

          <View style={styles.mapSection}>
            <Text style={[styles.sectionTitle, { color: colors.white }]}>
              Safety Zone Map
            </Text>
            <View
              style={[
                styles.mapCard,
                {
                  height: mapHeight,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <MapView
                ref={mapRef}
                style={styles.map}
                provider="google"
                region={region}
                onMapReady={() => onMapReady(mapRef)}
                onRegionChangeComplete={(nextRegion) => {
                  if (isAnimatingRef.current) return;
                  setRegion(nextRegion);
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                minZoomLevel={6}
                maxZoomLevel={18}
              >
                {crimeLocations.map((loc, index) => (
                  <Marker
                    key={`${loc.latitude}-${loc.longitude}-${index}`}
                    coordinate={{
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                    }}
                    title={loc.crimeType}
                  />
                ))}
              </MapView>

              <View style={styles.mapActions} pointerEvents="box-none">
                <OverlayButton
                  icon="fullscreen"
                  iconColor="#ffffff"
                  size={24}
                  onPress={() => setIsFullScreen((v) => !v)}
                />
                <OverlayButton
                  icon="add"
                  size={24}
                  onPress={() => zoom("in")}
                />
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

          <View
            style={[
              styles.legendPanel,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.secondary,
              },
            ]}
          >
            <View style={styles.legendRow}>
              {LEGEND_ITEMS.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.legendChip,
                    {
                      width: isCompact ? "47%" : undefined,
                      backgroundColor: item.chipBg,
                      borderColor: item.chipBorder,
                    },
                  ]}
                >
                  <Text style={[styles.legendText, { color: item.chipText }]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ImageBackground>

      {isFullScreen && (
        <View
          style={[
            styles.fullScreenOverlay,
            { backgroundColor: colors.background },
          ]}
          pointerEvents="auto"
        >
          <MapView
            ref={fullMapRef}
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
                key={`${loc.latitude}-${loc.longitude}-${index}`}
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
              top: insets.top + 12,
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    fontWeight: "500",
    opacity: 0.8,
  },
  searchCard: {
    borderWidth: 1,
    borderRadius: 18,
  },
  mapSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  mapCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  mapActions: {
    position: "absolute",
    top: 10,
    right: 10,
    gap: 10,
    zIndex: 999,
    elevation: 999,
  },
  legendPanel: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 12,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  legendChip: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 2,
    alignItems: "center",
  },
  legendText: {
    fontWeight: "700",
    fontSize: 12,
  },
  fullScreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
});

export default SafetyZone;
