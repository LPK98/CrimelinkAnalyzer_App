import PopupWindow from "@/src/components/UI/PopupWindow";
import { images } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/useAuth";
import { submitWeaponRequest } from "@/src/services/weapon/weaponService";
import { useTheme } from "@/src/theme/ThemeProvider";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import Slider from "@react-native-community/slider";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";

type WeaponRouteParams = {
  serialNo?: string;
  weaponType?: string;
  status?: string;
  updatedDate?: string;
  registerDate?: string;
};

const WeaponRequest = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [ammoCount, setAmmoCount] = useState(0);
  const [requestNote, setRequestNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const params = useLocalSearchParams<WeaponRouteParams>();

  const selectedWeaponType = params.weaponType ?? "Unknown Weapon";
  const selectedSerialNo = params.serialNo ?? "N/A";
  const selectedStatus = params.status ?? "N/A";

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString();
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const requestedById =
        typeof user?.id === "string" ? Number(user.id) : user?.id;

      if (!selectedSerialNo || selectedSerialNo === "N/A") {
        throw new Error("Weapon serial is missing");
      }

      if (!requestedById || Number.isNaN(requestedById)) {
        throw new Error("User is not available. Please login again.");
      }

      await submitWeaponRequest({
        weaponSerial: selectedSerialNo,
        ammoCount,
        requestNote,
        requestedById,
      });

      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Error submitting weapon request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessAcknowledge = () => {
    setShowSuccessPopup(false);
    router.replace("/(screens)/Weapon");
  };

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
              onPress={() => router.replace("/(screens)/WeaponRequest")}
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
                Weapon Request
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text }]}>
                Configure ammunition and submit your request.
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ImageBackground
              style={styles.weaponBanner}
              source={images.bgApp}
              imageStyle={{ borderRadius: 18 }}
            >
              <View
                style={[
                  styles.weaponBannerOverlay,
                  { backgroundColor: colors.overlay },
                ]}
              />
              <View style={styles.weaponBannerContent}>
                <Text style={[styles.weaponTypeText, { color: colors.white }]}>
                  {selectedWeaponType}
                </Text>
                <Text
                  style={[styles.weaponSerialText, { color: colors.white }]}
                >
                  {selectedSerialNo}
                </Text>
              </View>
            </ImageBackground>

            <View
              style={[
                styles.ammoCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Add Ammo
              </Text>
              <View style={styles.ammoValueRow}>
                <Text style={[styles.ammoValue, { color: colors.text }]}>
                  {ammoCount}
                </Text>
                <Text style={[styles.ammoUnit, { color: colors.text }]}>
                  ROUNDS
                </Text>
              </View>
              <Slider
                minimumValue={0}
                maximumValue={20}
                step={1}
                value={ammoCount}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                onValueChange={(value) => setAmmoCount(value)}
              />
            </View>

            <View
              style={[
                styles.infoCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" color={colors.text} size={22} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Registered Date: {formatDate(params.registerDate)}
                </Text>
              </View>

              <View
                style={[styles.divider, { borderBottomColor: colors.border }]}
              />

              <View style={styles.infoRow}>
                <Ionicons
                  name="shield-checkmark-outline"
                  color={colors.text}
                  size={22}
                />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Last Updated: {formatDate(params.updatedDate)}
                </Text>
              </View>

              <View
                style={[styles.divider, { borderBottomColor: colors.border }]}
              />

              <View style={styles.infoRow}>
                <SimpleLineIcons name="note" color={colors.text} size={20} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  Status: {selectedStatus}
                </Text>
              </View>

              <View
                style={[
                  styles.noteInputWrap,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="document-outline"
                  color={colors.text}
                  size={21}
                />
                <TextInput
                  placeholder="Enter request note"
                  placeholderTextColor={colors.sidebarItemMutedText}
                  value={requestNote}
                  onChangeText={setRequestNote}
                  style={[styles.noteInput, { color: colors.text }]}
                />
              </View>
            </View>

            <Pressable
              onPress={() => handleSubmit()}
              disabled={loading}
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.submitButtonText, { color: colors.white }]}>
                Submit Request
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </ImageBackground>

      {loading && !showSuccessPopup && (
        <PopupWindow>
          <View style={{ alignItems: "center", gap: 10 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.black, fontWeight: "600" }}>
              Submitting request...
            </Text>
          </View>
        </PopupWindow>
      )}

      {showSuccessPopup && (
        <PopupWindow>
          <View style={{ alignItems: "center", gap: 12 }}>
            <Ionicons
              name="checkmark-circle-outline"
              size={48}
              color={colors.primary}
            />
            <Text
              style={{
                color: colors.black,
                fontSize: 18,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Request Submitted
            </Text>
            <Text
              style={{
                color: colors.black,
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Your firearm request was submitted successfully.
            </Text>
            <Pressable
              onPress={handleSuccessAcknowledge}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 10,
                marginTop: 6,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Okay</Text>
            </Pressable>
          </View>
        </PopupWindow>
      )}
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
  weaponBanner: {
    height: 190,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  weaponBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  weaponBannerContent: {
    padding: 14,
  },
  weaponTypeText: {
    fontSize: 22,
    fontWeight: "700",
  },
  weaponSerialText: {
    marginTop: 4,
    fontSize: 15,
    opacity: 0.95,
  },
  ammoCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  ammoValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 8,
  },
  ammoValue: {
    fontSize: 34,
    fontWeight: "800",
  },
  ammoUnit: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
  },
  infoCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "100%",
  },
  noteInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  noteInput: {
    flex: 1,
    minHeight: 40,
    fontSize: 15,
    paddingVertical: 0,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    fontWeight: "700",
    fontSize: 16,
  },
});

export default WeaponRequest;
