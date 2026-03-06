import { useTheme } from "@/src/theme/ThemeProvider";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import * as Progress from "react-native-progress";
import WeaponListItem from "@/src/components/WeaponListItem";
import { images } from "@/src/constants/images";
import Slider from "@react-native-community/slider";

const BulletRequest = () => {
  const { colors } = useTheme();

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
          alignContent: "center",
        }}
      >
        <Pressable onPress={() => router.replace("/Weapon")}>
          <Ionicons name="chevron-back" color={colors.text} size={24} />
        </Pressable>
        <Text style={{ fontSize: 18, color: colors.text, fontWeight: "bold" }}>
          Bullet Request Screen
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
          paddingHorizontal: 10,
          backgroundColor: colors.card,
          padding: 15,
          borderRadius: 10,
        }}
      >
        <View style={{ flexDirection: "column", gap: 5 }}>
          <Text
            style={{ color: colors.primary, fontWeight: "500", fontSize: 16 }}
          >
            Request Limit
          </Text>
          <View
            style={{ flexDirection: "row", gap: 5, alignItems: "baseline" }}
          >
            <Text
              style={{ color: colors.text, fontSize: 28, fontWeight: "bold" }}
            >
              5 Units
            </Text>
            <Text
              style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}
            >
              Remaining
            </Text>
          </View>
        </View>
        <Progress.Circle
          size={50}
          progress={0.7}
          color={colors.primary}
          indeterminate={false}
        />
      </View>
      <View style={{ marginTop: 20, flexDirection: "column", gap: 10 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "500" }}>
          Select Weapon
        </Text>
        <WeaponListItem name="Ak-47" imageUrl={images.profile} />
        <View
          style={{
            padding: 15,
            backgroundColor: colors.card,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontWeight: "500",
              fontSize: 18,
              marginBottom: 10,
            }}
          >
            Ammiunition Count
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "baseline",
              width: "100%",
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 28,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              100
            </Text>
            <Text
              style={{ color: colors.text, fontSize: 16, textAlign: "center" }}
            >
              ROUNDS
            </Text>
          </View>
          <Slider
            style={{ marginVertical: 10 }}
            minimumValue={0}
            maximumValue={20}
            step={1}
          />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: colors.text, fontSize: 14 }}>0</Text>
            <Text style={{ color: colors.text, fontSize: 14 }}>20</Text>
          </View>
        </View>
        <Pressable
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: "center",
          }}
          onPress={() => console.log("Submit bullet request")}
        >
          <Text
            style={{ color: colors.white, fontSize: 18, fontWeight: "bold" }}
          >
            Submit Request
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default BulletRequest;
