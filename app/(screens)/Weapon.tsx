import WeaponCard from "@/src/components/WeaponCard";
import WeaponRequestCard from "@/src/components/WeaponRequestCard";
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
import { Pressable, ScrollView, Text, View } from "react-native";
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
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 10,
      }}
    >
      <View className="w-full h-full flex items-start justify-start">
        <View
          style={{ width: "100%" }}
          className="flex-row items-center gap-4 py-4"
        >
          <Pressable onPress={() => router.replace("/Dashboard")}>
            <Ionicons name="chevron-back" color={colors.text} size={24} />
          </Pressable>
          <Text
            className="text-3xl"
            style={{ color: colors.text, fontWeight: "bold" }}
          >
            Weapon Management
          </Text>
        </View>
        <ScrollView style={{ width: "100%", flex: 1 }}>
          <View>
            <Text style={{ color: colors.text, fontSize: 18 }}>
              Request for a Firearm & Ammiunition
            </Text>
            <Pressable
              onPress={() => router.push("/(screens)/WeaponRequest")}
              style={{
                backgroundColor: colors.primary,
                padding: 10,
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Request New Firearm
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(screens)/BulletRequest")}
              style={{
                backgroundColor: colors.primary,
                padding: 10,
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Request for Ammunition
              </Text>
            </Pressable>
          </View>
          <View>
            <Text style={{ color: colors.text, fontSize: 18 }}>
              Assigned Firearms
            </Text>
            {weaponsLoading ? (
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Loading...
              </Text>
            ) : weapons.length === 0 ? (
              <Text style={{ color: colors.text, fontSize: 16 }}>
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

          <View>
            <Text style={{ color: colors.text, fontSize: 18 }}>
              My Requests
            </Text>
            {requestsLoading ? (
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Loading...
              </Text>
            ) : requests.length === 0 ? (
              <Text style={{ color: colors.text, fontSize: 16 }}>
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
    </SafeAreaView>
  );
};

export default Weapon;
