import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";
import { fetchChatUsers, type ChatUser } from "../../src/services/chatService";

type SkeletonItem = { id: string };
type InboxListItem = ChatUser | SkeletonItem;

const SKELETON_ROWS: SkeletonItem[] = Array.from({ length: 5 }, (_, index) => ({
  id: `skeleton-${index}`,
}));

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "NA";
  return parts.map((part) => part[0].toUpperCase()).join("");
};

const isChatUser = (item: InboxListItem): item is ChatUser => {
  return "name" in item && "email" in item;
};

const formatLastActivity = (timestamp: number | null | undefined): string => {
  if (!timestamp) return "new";

  const now = Date.now();
  const diff = now - timestamp;
  const oneMinute = 60 * 1000;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;

  if (diff < oneMinute) return "now";
  if (diff < oneHour) return `${Math.max(1, Math.floor(diff / oneMinute))}m`;
  if (diff < oneDay) return `${Math.max(1, Math.floor(diff / oneHour))}h`;

  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const getPreviewText = (chatUser: ChatUser): string => {
  if (
    chatUser.lastMessagePreview &&
    chatUser.lastMessagePreview.trim().length > 0
  ) {
    return chatUser.lastMessagePreview;
  }
  return chatUser.email || "Tap to start secure conversation";
};

const byRecentActivity = (a: ChatUser, b: ChatUser): number => {
  const aTime = a.lastMessageAt ?? -1;
  const bTime = b.lastMessageAt ?? -1;

  if (aTime !== bTime) {
    return bTime - aTime;
  }

  return a.name.localeCompare(b.name);
};

const Inbox = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const shimmer = useRef(new Animated.Value(0.4)).current;
  const currentUserId = user?.id != null ? String(user.id) : undefined;

  useEffect(() => {
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

    let cancelled = false;

    const loadUsers = async () => {
      try {
        const loadedUsers = await fetchChatUsers(currentUserId);
        if (!cancelled) {
          setUsers(loadedUsers);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load contacts.";
          Alert.alert("Contacts Unavailable", message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
      animation.stop();
    };
  }, [currentUserId, shimmer]);

  const skeletonOpacity = useMemo(() => shimmer, [shimmer]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const orderedUsers = [...users].sort(byRecentActivity);

    if (!query) return orderedUsers;

    return orderedUsers.filter((chatUser) => {
      return (
        chatUser.name.toLowerCase().includes(query) ||
        chatUser.email.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, users]);

  const activeUsers = useMemo(() => filteredUsers.slice(0, 5), [filteredUsers]);

  const openConversation = (chatUser: ChatUser) => {
    router.push({
      pathname: "/(chat)/ChatScreen",
      params: {
        recipientId: chatUser.id,
        recipientName: chatUser.name,
        recipientEmail: chatUser.email,
      },
    });
  };

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

  const renderChat = ({ item }: { item: ChatUser }) => (
    <Pressable
      className="rounded-2xl bg-glass border border-stroke px-4 py-3 mb-3 active:opacity-80"
      onPress={() => openConversation(item)}
    >
      <View className="flex-row items-center">
        <View className="h-12 w-12 rounded-2xl bg-card items-center justify-center">
          <Text className="text-textPrimary font-semibold">
            {getInitials(item.name)}
          </Text>
          <View className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-ink" />
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-textPrimary text-base font-semibold">
              {item.name}
            </Text>
            <Text className="text-textMuted text-xs">
              {formatLastActivity(item.lastMessageAt)}
            </Text>
          </View>
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-sm text-textMuted" numberOfLines={1}>
              {getPreviewText(item)}
            </Text>
            <View className="ml-2 h-2 w-2 rounded-full bg-accent" />
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <View style={styles.topGlow} />

      <FlatList
        data={(loading ? SKELETON_ROWS : filteredUsers) as InboxListItem[]}
        keyExtractor={(item, index) => item?.id ?? `chat-${index}`}
        renderItem={({ item }) => {
          if (!isChatUser(item)) {
            return renderSkeleton();
          }
          return renderChat({ item });
        }}
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
                  value={searchQuery}
                  onChangeText={setSearchQuery}
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
                {activeUsers.map((activeUser) => (
                  <Pressable
                    key={activeUser.id}
                    className="mr-3 items-center"
                    onPress={() => openConversation(activeUser)}
                  >
                    <View className="h-12 w-12 rounded-2xl bg-card items-center justify-center">
                      <Text className="text-textPrimary font-semibold">
                        {getInitials(activeUser.name)}
                      </Text>
                      <View className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-ink" />
                    </View>
                    <Text className="text-textMuted text-xs mt-2">
                      {activeUser.name}
                    </Text>
                  </Pressable>
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
        ListEmptyComponent={
          loading ? null : (
            <View className="items-center mt-10 px-4">
              <Text className="text-textPrimary text-base font-semibold">
                No contacts found
              </Text>
              <Text className="text-textMuted text-sm mt-2 text-center">
                Try adjusting your search or check backend user availability.
              </Text>
            </View>
          )
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
