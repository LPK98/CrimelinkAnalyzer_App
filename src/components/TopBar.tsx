import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { icons } from "../constants/icons";
import { images } from "../constants/images";

type topbarProps = {
  openSidebar: () => void;
  closeSidebar?: () => void;
  name?: string;
};

const TopBar: React.FC<topbarProps> = ({ openSidebar, closeSidebar, name }) => {
  return (
    <View className="flex flex-row gap-5 justify-start items-center w-full">
      <Pressable onPress={openSidebar} hitSlop={10}>
        <Image
          source={icons.hamburgerMenu}
          style={{ width: 30, height: 30, backgroundColor: "#0B1220" }}
          resizeMode="contain"
        />
      </Pressable>
      <View className="flex flex-row gap-3 justify-start items-center w-full px-4">
        <Image
          source={images.profile}
          style={{ width: 50, height: 50, borderRadius: 25 }}
        />
        <Text className="text-md font-semiboldtext-gray-600">{`Welcome, ${name}`}</Text>
      </View>
    </View>
  );
};

export default TopBar;
