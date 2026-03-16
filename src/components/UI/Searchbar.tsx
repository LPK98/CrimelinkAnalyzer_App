import { useTheme } from "@/src/theme/ThemeProvider";
import React from "react";
import { TextInput, View } from "react-native";

const Searchbar = () => {
  const { colors } = useTheme();

  return (
    <View style={{ padding: 10 }}>
      <TextInput
        placeholder="🔍  Search location or sector..."
        className="bg-white rounded-lg p-2 w-full"
        style={{
          fontSize: 16,
          color: colors.white,
          paddingHorizontal: 12,
          borderRadius: 30,
          paddingVertical: 10,
          backgroundColor: "#11162F",
        }}
        placeholderTextColor="gray"
      />
    </View>
  );
};

export default Searchbar;
