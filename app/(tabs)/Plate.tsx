import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const Plate = () => {
  return (
    <View className="w-full h-full flex items-center justify-center">
      <Pressable
        className="flex w-20 justify-center items-center"
        onPress={() => router.back()}
      >
        <Text className="text-gray-700 text-2xl">Back</Text>
      </Pressable>
      <Text className="text-3xl">Plate</Text>
    </View>
  );
};

export default Plate;
