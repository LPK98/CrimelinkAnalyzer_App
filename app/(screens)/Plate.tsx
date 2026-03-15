import { images } from "@/src/constants/images";
import { useTheme } from "@/src/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../src/api/api";
import type { Vehicle } from "../../src/types/vehicle";

const VEHICLE_TYPES = [
  "All",
  "Car",
  "Van",
  "Lorry",
  "Motorcycle",
  "Other",
] as const;

const STATUS_TYPES = ["All", "Stolen", "Found"] as const;

function toYYYYMMDD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function PlateRegistryScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const pickerItemColor =
    Platform.OS === "android" ? colors.black : colors.text;

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  const [showLostDatePickerFilter, setShowLostDatePickerFilter] =
    useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/api/vehicles`);
      setVehicles(res.data ?? []);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Failed to fetch vehicles. Make sure backend is running and IP is correct.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  const filteredAndSortedVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        const plate = (v.numberPlate ?? "").toLowerCase();
        const owner = (v.ownerName ?? "").toLowerCase();

        const matchesSearch =
          plate.includes(searchTerm.toLowerCase()) ||
          owner.includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "All" || v.status === statusFilter;
        const matchesVehicleType =
          vehicleTypeFilter === "All" || v.vehicleType === vehicleTypeFilter;

        const matchesDate = !selectedDate || v.lostDate === selectedDate;

        return (
          matchesSearch && matchesStatus && matchesVehicleType && matchesDate
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.lostDate || "1970-01-01").getTime();
        const dateB = new Date(b.lostDate || "1970-01-01").getTime();
        return dateB - dateA;
      });
  }, [vehicles, searchTerm, statusFilter, vehicleTypeFilter, selectedDate]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setVehicleTypeFilter("All");
    setSelectedDate("");
  };

  const selectedDateLabel = selectedDate || "Any";

  const renderListHeader = () => (
    <View
      style={[
        styles.headerPanel,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.secondary,
        },
      ]}
    >
      <View style={styles.titleRow}>
        <Pressable
          onPress={() => router.replace("/Dashboard")}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.iconSurface,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="chevron-back" color={colors.primary} size={22} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>
          Plate Registry
        </Text>
      </View>

      <View
        style={[
          styles.searchWrapper,
          { backgroundColor: colors.iconSurface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={colors.primary} />
        <TextInput
          placeholder="Search by plate or owner name"
          placeholderTextColor={colors.sidebarItemMutedText}
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <View
        style={[
          styles.pickerRow,
          { flexDirection: isCompact ? "column" : "row", gap: 10 },
        ]}
      >
        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor: colors.iconSurface,
              borderColor: colors.border,
              width: isCompact ? "100%" : "50%",
            },
          ]}
        >
          <Picker
            selectedValue={statusFilter}
            onValueChange={(v) => setStatusFilter(String(v))}
            mode={Platform.OS === "android" ? "dialog" : undefined}
            style={{ color: colors.text }}
            dropdownIconColor={colors.primary}
          >
            {STATUS_TYPES.map((status) => (
              <Picker.Item
                key={status}
                label={status === "All" ? "All Status" : status}
                value={status}
                color={pickerItemColor}
              />
            ))}
          </Picker>
        </View>

        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor: colors.iconSurface,
              borderColor: colors.border,
              width: isCompact ? "100%" : "50%",
            },
          ]}
        >
          <Picker
            selectedValue={vehicleTypeFilter}
            onValueChange={(v) => setVehicleTypeFilter(String(v))}
            mode={Platform.OS === "android" ? "dialog" : undefined}
            style={{ color: colors.text }}
            dropdownIconColor={colors.primary}
          >
            {VEHICLE_TYPES.map((vehicleType) => (
              <Picker.Item
                key={vehicleType}
                label={
                  vehicleType === "All" ? "All Vehicle Types" : vehicleType
                }
                value={vehicleType}
                color={pickerItemColor}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View
        style={[
          styles.dateRow,
          {
            backgroundColor: colors.iconSurface,
            borderColor: colors.border,
            flexDirection: isCompact ? "column" : "row",
            alignItems: isCompact ? "flex-start" : "center",
          },
        ]}
      >
        <View>
          <Text style={[styles.dateTitle, { color: colors.text }]}>
            Lost Date
          </Text>
          <Text
            style={[styles.dateValue, { color: colors.sidebarItemMutedText }]}
          >
            {selectedDateLabel}
          </Text>
        </View>

        <View
          style={[
            styles.dateActions,
            {
              marginTop: isCompact ? 12 : 0,
              width: isCompact ? "100%" : "auto",
            },
          ]}
        >
          <Pressable
            style={[styles.smallButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowLostDatePickerFilter(true)}
          >
            <Text style={[styles.smallButtonText, { color: colors.white }]}>
              Pick
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.smallButton,
              {
                backgroundColor: colors.sidebarItemMutedText,
                minWidth: isCompact ? 96 : undefined,
              },
            ]}
            onPress={() => setSelectedDate("")}
          >
            <Text style={[styles.smallButtonText, { color: colors.white }]}>
              Clear
            </Text>
          </Pressable>
        </View>
      </View>

      {showLostDatePickerFilter && (
        <DateTimePicker
          value={selectedDate ? new Date(selectedDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowLostDatePickerFilter(false);
            if (date) setSelectedDate(toYYYYMMDD(date));
          }}
        />
      )}

      <View
        style={[
          styles.actionRow,
          { flexDirection: isCompact ? "column" : "row", gap: 10 },
        ]}
      >
        <Pressable
          style={[
            styles.actionButton,
            {
              backgroundColor: loading
                ? colors.sidebarItemMutedText
                : colors.primary,
            },
          ]}
          onPress={() => void fetchVehicles()}
          disabled={loading}
        >
          <Text style={[styles.actionButtonText, { color: colors.white }]}>
            Refresh
          </Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.accent }]}
          onPress={clearAllFilters}
        >
          <Text style={[styles.actionButtonText, { color: colors.white }]}>
            Clear Filters
          </Text>
        </Pressable>
      </View>

      {!!error && (
        <View style={[styles.errorCard, { backgroundColor: colors.danger }]}>
          <Text style={[styles.errorText, { color: colors.white }]}>
            {error}
          </Text>
          <Pressable onPress={() => setError(null)} style={styles.errorClose}>
            <Text style={[styles.errorCloseText, { color: colors.white }]}>
              x
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={images.bgApp}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <FlatList
            data={filteredAndSortedVehicles}
            keyExtractor={(item) =>
              String(item.id ?? `${item.numberPlate}-${item.ownerName}`)
            }
            ListHeaderComponent={renderListHeader}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              loading ? (
                <View
                  style={[
                    styles.loadingCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <ActivityIndicator color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.text }]}>
                    Loading vehicles...
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.emptyCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.emptyText,
                      { color: colors.sidebarItemMutedText },
                    ]}
                  >
                    No vehicles match the selected filters.
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => {
              const isFound = item.status === "Found";

              return (
                <View
                  style={[
                    styles.vehicleCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.vehicleHeader}>
                    <Text style={[styles.plateText, { color: colors.primary }]}>
                      {item.numberPlate || "-"}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isFound
                            ? "rgba(34, 197, 94, 0.18)"
                            : "rgba(239, 68, 68, 0.18)",
                          borderColor: isFound
                            ? "rgba(22, 163, 74, 0.55)"
                            : "rgba(220, 38, 38, 0.55)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: isFound ? "#16A34A" : "#DC2626" },
                        ]}
                      >
                        {item.status || "Unknown"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaGroup}>
                    <Text style={[styles.metaText, { color: colors.text }]}>
                      <Text style={styles.metaLabel}>Owner:</Text>{" "}
                      {item.ownerName || "-"}
                    </Text>
                    <Text style={[styles.metaText, { color: colors.text }]}>
                      <Text style={styles.metaLabel}>Type:</Text>{" "}
                      {item.vehicleType || "-"}
                    </Text>
                    <Text style={[styles.metaText, { color: colors.text }]}>
                      <Text style={styles.metaLabel}>Lost Date:</Text>{" "}
                      {item.lostDate || "-"}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  listContent: {
    paddingBottom: 22,
  },
  headerPanel: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
    elevation: 6,
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  searchWrapper: {
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 14,
  },
  pickerRow: {
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
    minHeight: 52,
  },
  dateRow: {
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  dateTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  dateValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "500",
  },
  dateActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  smallButton: {
    minWidth: 72,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  actionRow: {
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  errorCard: {
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  errorClose: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  errorCloseText: {
    fontWeight: "700",
  },
  separator: {
    height: 10,
  },
  loadingCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  vehicleCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  plateText: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
    flex: 1,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  metaGroup: {
    marginTop: 10,
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaLabel: {
    fontWeight: "700",
  },
});
