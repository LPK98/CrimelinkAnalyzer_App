import React from "react";
import { TextInput, View } from "react-native";

const Searchbar = () => {
  return (
    <View style={{ padding: 10 }}>
      <TextInput
        placeholder="Search location or sector..."
        className="bg-white rounded-lg p-2 w-full"
      />
    </View>
  );
};

export default Searchbar;
