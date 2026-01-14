import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAuth } from "../../src/auth/useAuth";

export default function FieldDashboard() {
  const { user, logout } = useAuth();

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold">Dashboard</Text>
      <Text className="text-gray-500 mt-2">Welcome, {user?.username}</Text>

      <Pressable onPress={logout} className="mt-6 bg-red-600 rounded-xl py-3 items-center">
        <Text className="text-white font-semibold">Logout</Text>
      </Pressable>
    </View>
  );
}
