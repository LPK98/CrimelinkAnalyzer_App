import { Button } from "@react-navigation/elements";
import { router, useNavigation } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const Login = () => {
  const navigation = useNavigation();

  return (
    <View className="w-full h-full flex items-center justify-center">
      <Text className="text-3xl">Login</Text>
      <Button
        onPress={() => {
          router.replace("/(tabs)/Dashboard");
        }}
      >
        Login
      </Button>
    </View>
  );
};

export default Login;
