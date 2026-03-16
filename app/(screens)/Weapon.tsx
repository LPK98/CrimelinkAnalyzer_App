import WeaponCard from "@/src/components/WeaponCard";
import WeaponRequestCard from "@/src/components/WeaponRequestCard";
import { images } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/useAuth";
import {
  getWeaponByOfficer,
  getWeaponRequestsByOfficer,
} from "@/src/services/weapon/weaponService";
import { useTheme } from "@/src/theme/ThemeProvider";
import { AssignedWeapon, WeaponRequestType } from "@/src/types/weaponTypes";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Weapon = () => {
  const { colors } = useTheme();
  const [weapons, setWeapons] = useState<AssignedWeapon[]>([]);
  const [requests, setRequests] = useState<WeaponRequestType[]>([]);
  const [weaponsLoading, setWeaponsLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const { user } = useAuth();

  const getMyWeaponRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const officerId =
        typeof user?.id === "string" ? Number(user.id) : user?.id;

      if (!officerId || Number.isNaN(officerId)) {
        setRequests([]);
        return;
      }

      const data = await getWeaponRequestsByOfficer(officerId);
      setRequests(Array.isArray(data) ? (data as WeaponRequestType[]) : []);
    } catch (error) {
      console.error("Error fetching weapon requests:", error);
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, [user?.id]);

  const getAssignedWeapons = useCallback(async () => {
    setWeaponsLoading(true);
    try {
      const officerId =
        typeof user?.id === "string" ? Number(user.id) : user?.id;

      if (!officerId || Number.isNaN(officerId)) {
        setWeapons([]);
        return;
      }

      const data = await getWeaponByOfficer(officerId);
      setWeapons(Array.isArray(data) ? (data as AssignedWeapon[]) : []);
    } catch (error) {
      console.error("Error fetching assigned weapons:", error);
      setWeapons([]);
    } finally {
      setWeaponsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    getAssignedWeapons();
    getMyWeaponRequests();
  }, [getAssignedWeapons, getMyWeaponRequests]);

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
            <Pressable
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
              <Ionicons name="chevron-back" color={colors.text} size={22} />
            </Pressable>

            <View style={styles.headerTextWrap}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Weapon Management
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text }]}>
                Firearms, ammunition, and active requests
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
                styles.heroCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Request Firearm and Ammunition
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.text }]}>
                Submit new requests and monitor assigned resources from one
                place.
              </Text>

              <Pressable
                onPress={() => router.push("/(screens)/WeaponRequest")}
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[styles.actionButtonText, { color: colors.white }]}
                >
                  Request New Firearm
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/(screens)/BulletRequest")}
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text
                  style={[styles.actionButtonText, { color: colors.white }]}
                >
                  Request Ammunition
                </Text>
              </Pressable>
            </View>

            <View style={styles.sectionWrap}>
              <Text style={[styles.sectionTitle, { color: colors.white }]}>
                Assigned Firearms
              </Text>

              {weaponsLoading ? (
                <Text style={[styles.statusText, { color: colors.white }]}>
                  Loading...
                </Text>
              ) : weapons.length === 0 ? (
                <Text style={[styles.statusText, { color: colors.white }]}>
                  No assigned firearms.
                </Text>
              ) : (
                weapons.map((weapon, index) => (
                  <WeaponCard
                    key={`${String(weapon.id ?? "weapon")}-${index}`}
                    name={weapon.weaponType ?? "Unknown"}
                    status={weapon.status ?? "N/A"}
                    ammoCount={weapon.ammoCount ?? 0}
                    totalAmmo={weapon.totalAmmo ?? 0}
                    dueDate={weapon.dueDate ?? "N/A"}
                  />
                ))
              )}
            </View>

            <View style={styles.sectionWrap}>
              <Text style={[styles.sectionTitle, { color: colors.white }]}>
                My Requests
              </Text>

              {requestsLoading ? (
                <Text style={[styles.statusText, { color: colors.white }]}>
                  Loading...
                </Text>
              ) : requests.length === 0 ? (
                <Text style={[styles.statusText, { color: colors.white }]}>
                  No weapon requests found.
                </Text>
              ) : (
                requests.map((request, index) => (
                  <WeaponRequestCard
                    key={`${String(request.requestId ?? "request")}-${request.weaponSerial ?? "unknown"}-${index}`}
                    weaponSerial={request.weaponSerial ?? "Unknown Serial"}
                    ammoCount={request.ammoCount ?? 0}
                    status={request.status ?? "PENDING"}
                    requestNote={request.requestNote}
                    requestedAt={request.requestedAt}
                    resolvedAt={request.resolvedAt}
                  />
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

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
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionWrap: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 15,
    opacity: 0.95,
  },
});

export default Weapon;
