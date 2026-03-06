import { useTheme } from "@/src/theme/ThemeProvider";
import { router } from "expo-router";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { ImageBackground } from "expo-image";
import Slider from "@react-native-community/slider";
import { images } from "@/src/constants/images";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { useState } from "react";

const WeaponRequest = () => {
  const { colors } = useTheme();
  const [ammoCount, setAmmoCount] = useState(0);

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
        <Pressable onPress={() => router.replace("/WeaponRequest")}>
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
            Weapon name
          </Text>
          <Text style={{ color: colors.white, fontSize: 16 }}>Serial no</Text>
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
              Issuing Date: {new Date().toLocaleDateString()}
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
              Return Date: {new Date().toLocaleDateString()}
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
              Notes: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => console.log("Submit request")}
          style={{
            backgroundColor: colors.primary,
            padding: 10,
            borderRadius: 10,
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Submit Request
          </Text>
        </Pressable>
      </View>
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
