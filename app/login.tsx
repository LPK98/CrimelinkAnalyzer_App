import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../src/hooks/useAuth";

const Logo = require("../assets/images/logo.png");
const bgImage = require("../assets/images/bgImage.png");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { login, loading } = useAuth();

  const handleSubmit = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <ImageBackground
      source={bgImage}
      resizeMode="contain"
      style={{ flex: 1, backgroundColor: "#0B1220" }}
    >
      <View className="flex-1 justify-center px-6">
        <View className="bg-white/90 rounded-2xl px-6 py-7">
          <Text className="text-2xl font-bold text-center">
            Crime Link Analyzer
          </Text>

          <Text className="text-center text-gray-600 mt-1">
            Crime Investigation Data Intelligent System
          </Text>

          <Text className="text-center text-lg font-semibold mt-4">
            Login to your Account
          </Text>

          {!!error && (
            <Text className="text-red-600 text-center mb-3">{error}</Text>
          )}

          <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-3 mt-2">
            <Ionicons name="person-outline" size={20} />
            <TextInput
              className="flex-1 ml-2"
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-3 mt-3">
            <Ionicons name="lock-closed-outline" size={20} />
            <TextInput
              className="flex-1 ml-2"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          <Pressable
            onPress={() => setRememberMe((v) => !v)}
            className="flex-row items-center mt-4"
            disabled={loading}
          >
            <View
              className={`w-5 h-5 rounded border border-gray-400 items-center justify-center ${
                rememberMe ? "bg-black" : "bg-white"
              }`}
            >
              {rememberMe ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : null}
            </View>
            <Text className="ml-2 text-gray-700">Remember Me</Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className={`rounded-xl py-4 items-center mt-5 ${
              loading ? "bg-gray-500" : "bg-black"
            }`}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" />
                <Text className="text-white font-semibold ml-2">
                  Logging in...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold">Login</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              console.log("Forgot Password pressed");
            }}
            className="mt-4"
            disabled={loading}
          >
            <Text className="text-center text-blue-600">Forgot Password?</Text>
          </Pressable>

          <Text className="text-center text-xs text-gray-600 mt-5">
            Access to this System is restricted to authorized personnel of Sri
            Lanka Crime Division only.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}
