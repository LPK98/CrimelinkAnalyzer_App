import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image, // Added for image preview
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // npx expo install expo-image-picker

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

const { width } = Dimensions.get("window");

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: string; [key: string]: any }>
  >([]);
  const [uploading, setUploading] = useState(false);

  const currentUserId = "User1";

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  // --- IMAGE UPLOADING FEATURE ---
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        // For a basic setup, we save the local URI to Firestore.
        // In a production app, you would upload this to Firebase Storage first.
        await addDoc(collection(db, "messages"), {
          image: result.assets[0].uri,
          sender: currentUserId,
          createdAt: serverTimestamp(),
          type: "image",
        });
      } catch (error) {
        console.error("Upload Error:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      await addDoc(collection(db, "messages"), {
        text: message,
        sender: currentUserId,
        createdAt: serverTimestamp(),
        type: "text",
      });
      setMessage("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* HEADER: Adjusted for lower placement */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JB</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Jineth Bosilu
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Sri Lanka Police Field App
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flexOne}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.dateSeparator}>
              <Text style={styles.dateText}>TODAY</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubbleContainer,
                item.sender === currentUserId
                  ? styles.myBubbleAlign
                  : styles.theirBubbleAlign,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  item.sender === currentUserId
                    ? styles.myBubble
                    : styles.theirBubble,
                  item.image && { padding: 5 }, // Less padding for images
                ]}
              >
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.messageImage}
                  />
                ) : (
                  <Text
                    style={
                      item.sender === currentUserId
                        ? styles.myText
                        : styles.theirText
                    }
                  >
                    {item.text}
                  </Text>
                )}
              </View>
            </View>
          )}
        />

        {/* INPUT: Added camera button functionality */}
        <SafeAreaView style={styles.inputAreaBackground}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={pickImage}
              disabled={uploading}
            >
              <Ionicons
                name="camera-outline"
                size={width * 0.08}
                color={uploading ? "#ccc" : "#999"}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Type message........."
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline={true}
              blurOnSubmit={false}
            />

            <TouchableOpacity
              style={[
                styles.sendCircle,
                !message.trim() && styles.disabledSend,
              ]}
              onPress={sendMessage}
              disabled={!message.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="paper-plane" size={width * 0.05} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F5F7F9" },
  flexOne: { flex: 1 },
  header: {
    backgroundColor: "#121420",
    paddingTop: 15, // Added padding to lower the nav content
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "5%",
    marginTop: 50, // Moves the content further down
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontWeight: "700", fontSize: 16, color: "#121420" },
  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#34C759",
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#121420",
  },
  headerTextContainer: { marginLeft: 15, flexShrink: 1 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  headerSubtitle: { color: "#A0A0A0", fontSize: 13 },

  listContent: { paddingHorizontal: "4%", paddingBottom: 15 },

  bubbleContainer: { width: "100%", marginVertical: 4 },
  myBubbleAlign: { alignItems: "flex-end" },
  theirBubbleAlign: { alignItems: "flex-start" },

  bubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 22,
  },
  messageImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 15,
  },
  myBubble: {
    backgroundColor: "#121420",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    elevation: 2,
  },
  myText: { color: "#fff", fontSize: 15, lineHeight: 20 },
  theirText: { color: "#1A1A1A", fontSize: 15, lineHeight: 20 },

  dateSeparator: { alignSelf: "center", marginVertical: 20 },
  dateText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "bold",
    letterSpacing: 1,
  },

  inputAreaBackground: { backgroundColor: "#fff" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "3%",
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginHorizontal: 10,
    fontSize: 16,
    maxHeight: 120,
  },
  iconButton: { padding: 5 },
  sendCircle: {
    backgroundColor: "#121420",
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledSend: { backgroundColor: "#A0A0A0" },
});
