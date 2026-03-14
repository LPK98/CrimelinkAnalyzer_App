import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_CHATS = [
  {
    id: "1",
    name: "Jineth Bosilu",
    message: "I sent the incident photo and location pin.",
    time: "2m",
    unread: true,
    active: true,
    initials: "JB",
  },
  {
    id: "2",
    name: "P.L. Pushpakumaran",
    message: "Update your duty schedule for today.",
    time: "18m",
    unread: false,
    active: true,
    initials: "PP",
  },
  {
    id: "3",
    name: "Isira Hansaja",
    message: "Review the vehicle lookup status soon.",
    time: "1h",
    unread: false,
    active: false,
    initials: "IH",
  },
  {
    id: "4",
    name: "Arosha Udara",
    message: "Need the report summary by end of shift.",
    time: "2h",
    unread: true,
    active: false,
    initials: "AU",
  },
  {
    id: "5",
    name: "Dasuni Thimasha",
    message: "Please focus your work and send notes.",
    time: "4h",
    unread: false,
    active: true,
    initials: "DT",
  },
];

const ACTIVE_USERS = [
  { id: "a1", name: "Jineth", initials: "JB" },
  { id: "a2", name: "Dasuni", initials: "DT" },
  { id: "a3", name: "Isira", initials: "IH" },
  { id: "a4", name: "Arosha", initials: "AU" },
  { id: "a5", name: "P.L.", initials: "PP" },
];

const Inbox = () => {
  const [loading, setLoading] = useState(true);
  const shimmer = useRef(new Animated.Value(0.4)).current;
  const skeletonChats = useMemo(() => MOCK_CHATS.slice(0, 5), []);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 900);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 0.9,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      clearTimeout(timeout);
      animation.stop();
    };
  }, [shimmer]);

  const skeletonOpacity = useMemo(() => shimmer, [shimmer]);

  const renderSkeleton = () => (
    <Animated.View
      className="rounded-2xl bg-glass border border-stroke px-4 py-4 mb-3"
      style={{ opacity: skeletonOpacity }}
    >
      <View className="flex-row items-center">
        <View className="h-12 w-12 rounded-2xl bg-surface" />
        <View className="ml-3 flex-1">
          <View className="h-3 w-32 rounded-full bg-surface" />
          <View className="mt-2 h-3 w-48 rounded-full bg-surface" />
        </View>
      </View>
    </Animated.View>
  );

  const renderChat = ({ item }: { item: (typeof MOCK_CHATS)[number] }) => (
    <Pressable className="rounded-2xl bg-glass border border-stroke px-4 py-3 mb-3 active:opacity-80">
      <View className="flex-row items-center">
        <View className="h-12 w-12 rounded-2xl bg-card items-center justify-center">
          <Text className="text-textPrimary font-semibold">
            {item.initials}
          </Text>
          {item.active ? (
            <View className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-ink" />
          ) : null}
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-textPrimary text-base ${
                item.unread ? "font-semibold" : "font-medium"
              }`}
            >
              {item.name}
            </Text>
            <Text className="text-textMuted text-xs">{item.time}</Text>
          </View>
          <View className="mt-1 flex-row items-center justify-between">
            <Text
              className={`text-sm ${
                item.unread ? "text-textSecondary" : "text-textMuted"
              }`}
              numberOfLines={1}
            >
              {item.message}
            </Text>
            {item.unread ? (
              <View className="ml-2 h-2 w-2 rounded-full bg-accent" />
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <View style={styles.topGlow} />

      <FlatList
        data={loading ? skeletonChats : MOCK_CHATS}
        keyExtractor={(item, index) => item?.id ?? `chat-${index}`}
        renderItem={loading ? renderSkeleton : renderChat}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-textPrimary text-2xl font-semibold">
                  Inbox
                </Text>
                <Text className="text-textMuted mt-1">
                  Secure updates from your field network
                </Text>
              </View>
              <View className="flex-row items-center">
                <Pressable className="h-10 w-10 rounded-full bg-glass border border-stroke items-center justify-center mr-2">
                  <Ionicons
                    name="notifications-outline"
                    size={18}
                    color="#E9ECF8"
                  />
                </Pressable>
                <Pressable className="h-10 w-10 rounded-full bg-glass border border-stroke items-center justify-center">
                  <Ionicons
                    name="ellipsis-vertical"
                    size={18}
                    color="#E9ECF8"
                  />
                </Pressable>
              </View>
            </View>

            <View className="mt-5 rounded-2xl">
              <View className="flex-row items-center px-4 py-3 bg-glass border border-stroke rounded-2xl">
                <Ionicons name="search" size={18} color="#A5B0D8" />
                <TextInput
                  placeholder="Search by unit, sector, or keyword"
                  placeholderTextColor="#7783B5"
                  className="ml-3 flex-1 text-textPrimary"
                />
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color="#5B7CFF"
                />
              </View>
            </View>

            <View className="mt-6">
              <Text className="text-textSecondary text-sm mb-3">
                Active now
              </Text>
              <View className="flex-row">
                {ACTIVE_USERS.map((user) => (
                  <View key={user.id} className="mr-3 items-center">
                    <View className="h-12 w-12 rounded-2xl bg-card items-center justify-center">
                      <Text className="text-textPrimary font-semibold">
                        {user.initials}
                      </Text>
                      <View className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-ink" />
                    </View>
                    <Text className="text-textMuted text-xs mt-2">
                      {user.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-6 flex-row items-center justify-between">
              <Text className="text-textSecondary text-sm">
                Recent conversations
              </Text>
              <Text className="text-accent text-xs">View all</Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Inbox;

const styles = StyleSheet.create({
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: "rgba(91,124,255,0.18)",
  },
});
