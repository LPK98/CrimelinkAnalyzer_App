import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { icons } from "../constants/icons";
import Feather from "react-native-vector-icons/Feather";
import { images } from "../constants/images";
import { useTheme } from "../theme/ThemeProvider";

type topbarProps = {
  openSidebar: () => void;
  closeSidebar?: () => void;
  name?: string;
};

const TopBar: React.FC<topbarProps> = ({ openSidebar, closeSidebar, name }) => {
  const { colors } = useTheme();

  return (
    <View className="flex flex-row gap-5 justify-start items-center w-full">
      <Pressable onPress={openSidebar} hitSlop={10}>
        <Feather name="menu" color={colors.text} size={30} />
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
