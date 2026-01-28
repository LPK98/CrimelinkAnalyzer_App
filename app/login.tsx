import React, { useState } from "react";
import {
  ImageBackground,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../src/hooks/useAuth";
import { images } from "@/src/constants/images";

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
      source={images.bgApp}
      style={styles.container}
      resizeMode="cover"
      imageStyle={{ opacity: 0.1 }}
    >
      {/* LOGO */}
      <Image
        source={images.logo}
        style={styles.logo}
      />

      {/* TITLE */}
      <Text style={styles.title}>Crime Link Analyzer</Text>
      <Text style={styles.subtitle}>Field Officer Secure Portal</Text>

      {/* LOGIN TEXT */}
      <Text style={styles.loginText}>Login to your account</Text>

      {/* USERNAME */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        placeholderTextColor="#cbd5e1"
        value={email}
        onChangeText={setEmail}
      />

      {/* PASSWORD */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        placeholderTextColor="#cbd5e1"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* REMEMBER ME */}
      <View style={styles.rememberRow}>
        <TouchableOpacity
          style={[styles.checkbox, rememberMe && styles.checkboxActive]}
          onPress={() => setRememberMe(!rememberMe)}
        />
        <Text style={styles.rememberText}>Remember me</Text>
      </View>

      {/* LOGIN BUTTON */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>LOGIN</Text>
      </TouchableOpacity>

      {/* FORGOT PASSWORD */}
      <Text style={styles.forgot}>Forgot Password</Text>

      {/* FINGERPRINT */}
      <Image source={images.fingerprint} style={styles.fingerprint} />

      {/* FOOTER */}
      <Text style={styles.footer}>
        Access to this system is restricted to authorized personnel of the Sri
        Lanka Crime Division only
      </Text>

      {/* END OF BACKGROUND IMAGE */}
      <View style={styles.overlay}></View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 80,
  },

  logo: {
    width: 70,
    height: 70,
    marginBottom: 20,
    resizeMode: "contain",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  subtitle: {
    color: "#cbd5f5",
    fontSize: 12,
    marginBottom: 40,
  },

  loginText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 25,
  },

  label: {
    alignSelf: "flex-start",
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
  },

  input: {
    width: "100%",
    height: 48,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 25,
    paddingHorizontal: 18,
    marginBottom: 18,
    color: "#000",
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 30,
  },

  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: "#e5e7eb",
    marginRight: 8,
  },

  checkboxActive: {
    backgroundColor: "#4f46e5",
  },

  rememberText: {
    color: "#fff",
    fontSize: 13,
  },

  loginButton: {
    backgroundColor: "#4f46e5",
    width: 120,
    height: 42,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  forgot: {
    color: "#e5e7eb",
    fontSize: 14,
    marginBottom: 30,
  },

  fingerprint: {
    width: 56,
    height: 56,
    marginBottom: 30,
    resizeMode: "contain",
  },

  footer: {
    color: "#cbd5f5",
    fontSize: 9,
    textAlign: "center",
    position: "absolute",
    bottom: 25,
    paddingHorizontal: 20,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)", // 0.6 = opacity
  },
});
