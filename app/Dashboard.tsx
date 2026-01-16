import { icons } from "@/src/constants/icons";
import { useAuth } from "@/src/hooks/useAuth";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <View className="w-full h-full flex items-center justify-center">
      <Text className="text-gray-500 mt-2">Welcome, {user?.username}</Text>
      <Text className="text-3xl">Dashboard</Text>
      <Pressable
        onPress={logout}
        className="mt-6 bg-red-600 rounded-xl py-3 items-center"
      >
        <Text className="text-white font-semibold">Logout</Text>
      </Pressable>
      {/* ------ */}
      <Pressable onPress={() => router.replace("/(tabs)/FaceDetection")}>
        <Image style={{ width: 20, height: 20, marginBottom: 8 }} source={icons.faceRecognition} />
        <Text className="bg-red-600">Face Recognition</Text>
      </Pressable>
      <Pressable onPress={() => router.replace("/(tabs)/Weapon")}>
        <Text>Weapon Management</Text>
      </Pressable>
      <Pressable onPress={() => router.replace("/(tabs)/Plate")}>
        <Text>Number Plates</Text>
      </Pressable>
      <Pressable onPress={() => router.replace("/(tabs)/Duty")}>
        <Text>Duty Management</Text>
      </Pressable>
      <Pressable onPress={() => router.replace("/(tabs)/Weapon")}>
        <Text>Safety Zone</Text>
      </Pressable>
      <Pressable onPress={() => router.replace("/(tabs)/Weapon")}>
        <Text>Schedule</Text>
      </Pressable>
      <Pressable onPress={() => router.replace("/(tabs)/Weapon")}>
        <Text>Messages</Text>
      </Pressable>
    </View>
  );
};

export default Dashboard;
