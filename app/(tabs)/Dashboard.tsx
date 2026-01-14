import { useAuth } from "@/src/hooks/useAuth";
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
    </View>
  );
};

export default Dashboard;
