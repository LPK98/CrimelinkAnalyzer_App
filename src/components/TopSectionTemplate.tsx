import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import { images } from "../constants/images";

type props = {
  heading: string;
  subHeading: string;
  children?: React.ReactNode;
};

const TopSectionTemplate: React.FC<props> = ({
  heading,
  subHeading,
  children,
}) => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        backgroundColor: "#0B0C1A",
        zIndex: 10,
        elevation: 10,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <View
        className="flex flex-row justify-start items-center"
        style={{ gap: 15, padding: 15 }}
      >
        <Image source={images.logo} style={{ height: 60, width: 60 }} />
        <View
          className="flex flex-col justify-center items-start"
          style={{ gap: 4 }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF" }}>
            {heading}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#FFFFFF" }}>
            {subHeading}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};

export default TopSectionTemplate;
