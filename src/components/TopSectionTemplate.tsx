import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { images } from "../constants/images";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/build/Ionicons";

type props = {
  heading?: string;
  subHeading: string;
  children?: React.ReactNode;
};

const TopSectionTemplate: React.FC<props> = ({
  heading,
  subHeading,
  children,
}) => {
  return (
    <View style={{ flex: 1, backgroundColor: "#0B0C1A" }}>
      <View
        style={{
          flex: 1,
          flexDirection: "column",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 15,
            padding: 15,
          }}
        >
          <Pressable onPress={() => router.replace("/Dashboard")}>
            <Ionicons name="chevron-back" color="#FFFFFF" size={24} />
          </Pressable>
          <Image source={images.logo} style={{ height: 60, width: 60 }} />
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF" }}>
              {heading ?? "Crime Link Analyzer"}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#FFFFFF" }}>
              {subHeading ?? "Sub Heading"}
            </Text>
          </View>
        </View>
        {/* content */}
        <View style={{ flex: 1, paddingBottom: 50 }}>{children}</View>
      </View>
    </View>
  );
};

export default TopSectionTemplate;
