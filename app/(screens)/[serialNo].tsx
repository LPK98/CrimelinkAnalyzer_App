import PopupWindow from "@/src/components/UI/PopupWindow";
import { images } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/useAuth";
import { submitWeaponRequest } from "@/src/services/weapon/weaponService";
import { useTheme } from "@/src/theme/ThemeProvider";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import Slider from "@react-native-community/slider";
import { ImageBackground } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
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
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 10,
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Pressable onPress={() => router.replace("/(screens)/WeaponRequest")}>
          <Ionicons name="chevron-back" color={colors.text} size={24} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "bold" }}>
          Weapon Request Screen
        </Text>
      </View>
      <View>
        <ImageBackground
          style={{
            height: "40%",
            padding: 10,
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 20,
          }}
          source={images.bgApp}
        >
          <View style={{ flex: 1 }} />
          <Text
            style={{
              color: colors.white,
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            {selectedWeaponType}
          </Text>
          <Text style={{ color: colors.white, fontSize: 16 }}>
            {selectedSerialNo}
          </Text>
        </ImageBackground>

        <Text
          style={{
            marginBottom: 10,
            color: colors.text,
            fontSize: 18,
            fontWeight: "500",
          }}
        >
          Add Ammo
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "400" }}>
            Ammo Count: {ammoCount}
          </Text>
          <Slider
            minimumValue={0}
            maximumValue={20}
            step={1}
            value={ammoCount}
            onValueChange={(value) => setAmmoCount(value)}
          />
        </View>
        <View
          style={{
            backgroundColor: colors.card,
            padding: 10,
            borderRadius: 10,
            marginTop: 20,
            gap: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Ionicons name="time-outline" color={colors.text} size={24} />
            <Text
              style={{ color: colors.text, fontSize: 16, fontWeight: "400" }}
            >
              Registered Date: {formatDate(params.registerDate)}
            </Text>
          </View>
          <View style={styles.container}>
            <View style={styles.line} />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Ionicons
              name="shield-checkmark-outline"
              color={colors.text}
              size={24}
            />
            <Text
              style={{ color: colors.text, fontSize: 16, fontWeight: "400" }}
            >
              Last Updated: {formatDate(params.updatedDate)}
            </Text>
          </View>
          <View style={styles.container}>
            <View style={styles.line} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <SimpleLineIcons name="note" color={colors.text} size={24} />
            <Text
              style={{ color: colors.text, fontSize: 16, fontWeight: "400" }}
            >
              Status: {selectedStatus}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="document-outline" color={colors.text} size={25} />
            <TextInput
              placeholder="Enter request note"
              value={requestNote}
              onChangeText={setRequestNote}
              style={{
                backgroundColor: colors.card,
                borderRadius: 10,
                fontSize: 16,
                width: "100%",
              }}
            />
          </View>
        </View>
        <Pressable
          onPress={() => handleSubmit()}
          disabled={loading}
          style={{
            backgroundColor: colors.primary,
            padding: 10,
            borderRadius: 10,
            marginTop: 20,
            alignItems: "center",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Submit Request
          </Text>
        </Pressable>
      </View>

      {loading && !showSuccessPopup && (
        <PopupWindow>
          <View style={{ alignItems: "center", gap: 10 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: "600" }}>
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
                color: colors.text,
                fontSize: 18,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Request Submitted
            </Text>
            <Text
              style={{
                color: colors.text,
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  line: {
    borderBottomColor: "#111111",
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "100%",
  },
});

export default WeaponRequest;
