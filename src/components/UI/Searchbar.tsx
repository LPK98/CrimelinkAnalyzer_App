import React from "react";
import { TextInput, View } from "react-native";

const Searchbar = () => {
  return (
    <View style={{ padding: 10 }}>
      <TextInput
        placeholder="🔍  Search location or sector..."
        className="bg-white rounded-lg p-2 w-full"
        style={{
          fontSize: 16,
          color: "black",
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
