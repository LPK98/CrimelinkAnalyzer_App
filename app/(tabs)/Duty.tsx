import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const Duty = () => {
  return (
    <View className="w-full h-full flex items-center justify-center">
      <Pressable
        className="flex  justify-center items-center"
        onPress={() => router.replace("/Dashboard")}
      >
        <Text className="text-gray-700 text-2xl">Back to Dashboard</Text>
      </Pressable>
      <Pressable
        className="flex w-20 justify-center items-center"
        onPress={() => router.back()}
      >
        <Text className="text-gray-700 text-2xl">Back</Text>
      </Pressable>
      <Text className="text-3xl">Duty</Text>
    </View>
  );
};

export default Duty;
