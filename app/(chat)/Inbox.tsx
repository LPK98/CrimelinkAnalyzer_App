import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";
import { fetchChatUsers, type ChatUser } from "../../src/services/chatService";

type SkeletonItem = { id: string };

const SKELETON_ROWS: SkeletonItem[] = Array.from({ length: 5 }, (_, index) => ({
  id: `skeleton-${index}`,
}));

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "NA";
  return parts.map((part) => part[0].toUpperCase()).join("");
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

const formatLastUpdated = (timestamp: number | null): string => {
  if (!timestamp) return "Not synced yet";
  return `Updated ${formatLastActivity(timestamp)} ago`;
};

const Inbox = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const shimmer = useRef(new Animated.Value(0.4)).current;
  const currentUserId = user?.id != null ? String(user.id) : undefined;

  const loadUsers = useCallback(
    async (silent = false) => {
      if (!currentUserId) {
        setLoading(false);
        setRefreshing(false);
        setLoadError("Your session is not ready. Please log in again.");
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const loadedUsers = await fetchChatUsers(currentUserId);
        setUsers(loadedUsers);
        setLoadError(null);
        setLastUpdatedAt(Date.now());
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load contacts.";
        setLoadError(message);
        Alert.alert("Contacts Unavailable", message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUserId],
  );

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

    void loadUsers();

    return () => {
      animation.stop();
    };
  }, [loadUsers, shimmer]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 220);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const skeletonOpacity = useMemo(() => shimmer, [shimmer]);

  const sortedUsers = useMemo(() => {
    return [...users].sort(byRecentActivity);
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedUsers;

    return sortedUsers.filter((chatUser) => {
      return (
        chatUser.name.toLowerCase().includes(query) ||
        chatUser.email.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, sortedUsers]);

  const activeUsers = useMemo(() => sortedUsers.slice(0, 8), [sortedUsers]);

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
    <Animated.View style={[styles.skeletonCard, { opacity: skeletonOpacity }]}>
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonTextGroup}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonPreview} />
        </View>
      </View>
    </Animated.View>
  );

  const renderChat = ({ item }: { item: ChatUser }) => (
    <Pressable
      className="rounded-2xl bg-glass border border-stroke px-4 py-3 mb-3 active:opacity-80"
      onPress={() => openConversation(item)}
      accessibilityRole="button"
      accessibilityLabel={`Open conversation with ${item.name}`}
      accessibilityHint={`Last update ${formatLastActivity(item.lastMessageAt)}`}
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
            {item.lastMessageAt ? (
              <View className="ml-2 h-2 w-2 rounded-full bg-accent" />
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );

  const onRefresh = () => {
    void loadUsers(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <View style={styles.topGlow} />
      <View style={styles.sideGlow} />

      <FlatList
        data={loading ? SKELETON_ROWS : filteredUsers}
        keyExtractor={(item, index) => item?.id ?? `chat-${index}`}
        refreshing={refreshing}
        onRefresh={onRefresh}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        renderItem={({ item }) => {
          if (loading) {
            return renderSkeleton();
          }
          return renderChat({ item: item as ChatUser });
        }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <View className="mb-6">
            <View>
              <Text className="text-textPrimary text-4xl font-bold tracking-tight">
                Inbox
              </Text>
              <Text className="text-textMuted mt-1 text-sm">
                Encrypted updates across your field network
              </Text>
              <Text className="text-accent mt-2 text-xs font-semibold uppercase tracking-wide">
                {formatLastUpdated(lastUpdatedAt)}
              </Text>
            </View>

            {loadError ? (
              <View className="mt-5 rounded-2xl border border-red-500/40 bg-red-900/25 px-4 py-3">
                <View className="flex-row items-center">
                  <Ionicons name="warning-outline" size={16} color="#FCA5A5" />
                  <Text className="ml-2 flex-1 text-red-100 text-sm">
                    {loadError}
                  </Text>
                </View>
                <Pressable
                  className="mt-2 self-start rounded-xl border border-red-300/50 px-3 py-1"
                  onPress={() => void loadUsers(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading contacts"
                >
                  <Text className="text-red-100 text-xs font-semibold">
                    Retry
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <View className="mt-5 rounded-3xl">
              <View className="flex-row items-center px-4 py-3 bg-glass border border-stroke rounded-3xl">
                <Ionicons name="search" size={18} color="#A5B0D8" />
                <TextInput
                  placeholder="Search by unit, sector, or keyword"
                  placeholderTextColor="#7783B5"
                  className="ml-3 flex-1 text-textPrimary"
                  value={searchInput}
                  onChangeText={setSearchInput}
                  accessibilityLabel="Search conversations"
                />
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color="#5B7CFF"
                />
              </View>
            </View>

            <View className="mt-6">
              <Text className="text-textSecondary text-xs mb-3 font-semibold uppercase tracking-wide">
                Active now
              </Text>
              {loading ? (
                <View style={styles.activeLoadingHint}>
                  <Text className="text-textMuted text-xs">
                    Loading active contacts...
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.activeRow}
                >
                  {activeUsers.map((activeUser) => (
                    <Pressable
                      key={activeUser.id}
                      className="mr-3 items-center"
                      onPress={() => openConversation(activeUser)}
                      accessibilityRole="button"
                      accessibilityLabel={`Start chat with ${activeUser.name}`}
                    >
                      <View className="h-14 w-14 rounded-2xl bg-card items-center justify-center border border-stroke">
                        <Text className="text-textPrimary font-semibold">
                          {getInitials(activeUser.name)}
                        </Text>
                        <View className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-ink" />
                      </View>
                      <Text
                        className="text-textMuted text-xs mt-2"
                        numberOfLines={1}
                      >
                        {activeUser.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>

            <View className="mt-6 flex-row items-center justify-between">
              <Text className="text-textSecondary text-xs font-semibold uppercase tracking-wide">
                Recent conversations
              </Text>
              <Text className="text-accent text-xs">
                {filteredUsers.length} threads
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <View className="items-center mt-10 px-4">
              <Text className="text-textPrimary text-base font-semibold">
                {searchQuery ? "No matching contacts" : "No contacts found"}
              </Text>
              <Text className="text-textMuted text-sm mt-2 text-center">
                {searchQuery
                  ? "Try a different keyword or clear search."
                  : "Pull to refresh or check backend user availability."}
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
  skeletonCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(91,124,255,0.2)",
    backgroundColor: "rgba(26, 35, 68, 0.62)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(120, 137, 190, 0.35)",
  },
  skeletonTextGroup: {
    marginLeft: 12,
    flex: 1,
  },
  skeletonTitle: {
    height: 10,
    width: "42%",
    borderRadius: 999,
    backgroundColor: "rgba(120, 137, 190, 0.4)",
  },
  skeletonPreview: {
    marginTop: 10,
    height: 10,
    width: "68%",
    borderRadius: 999,
    backgroundColor: "rgba(120, 137, 190, 0.28)",
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: "rgba(91,124,255,0.18)",
  },
  sideGlow: {
    position: "absolute",
    top: 140,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(0, 207, 255, 0.10)",
  },
  activeRow: {
    paddingRight: 12,
  },
  activeLoadingHint: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
