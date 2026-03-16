import WeaponListItem from "@/src/components/WeaponListItem";
import { images } from "@/src/constants/images";
import { getAllWeapons } from "@/src/services/weapon/weaponService";
import { useTheme } from "@/src/theme/ThemeProvider";
import { weaponType } from "@/src/types/weaponTypes";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WeaponRequest = () => {
  const { colors } = useTheme();
  const [weapons, setWeapons] = useState<weaponType[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchWeapons() {
    try {
      setLoading(true);
      const data = await getAllWeapons();
      setWeapons(Array.isArray(data) ? (data as weaponType[]) : []);
    } catch (error) {
      console.error("Failed to fetch weapons:", error);
      setWeapons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeapons();
  }, []);

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
              onPress={() => router.replace("/(screens)/Weapon")}
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
                Select a Weapon
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text }]}>
                Choose the assigned firearm to create a request.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.listPanel,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.secondary,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Available Weapons
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            >
              {loading ? (
                <Text style={[styles.stateText, { color: colors.text }]}>
                  Loading weapons...
                </Text>
              ) : weapons.length === 0 ? (
                <Text style={[styles.stateText, { color: colors.text }]}>
                  No weapons found.
                </Text>
              ) : (
                weapons.map((weapon) => (
                  <WeaponListItem
                    key={
                      weapon.serialNumber ?? `${weapon.weaponType ?? "weapon"}`
                    }
                    weapon={weapon}
                  />
                ))
              )}
            </ScrollView>
          </View>
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
    paddingBottom: 12,
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
  listPanel: {
    flex: 1,
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 16,
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  listContent: {
    paddingTop: 2,
    paddingBottom: 16,
  },
  stateText: {
    marginTop: 14,
    fontSize: 15,
  },
});

export default WeaponRequest;
