import Ionicons from "@expo/vector-icons/build/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { API_BASE_URL } from "../../src/api/api";
import type { Vehicle } from "../../src/types/vehicle";

type VehicleForm = {
  numberPlate: string;
  ownerName: string;
  vehicleType: string;
  status: string;
  lostDate: string;
};

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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  const [showLostDatePickerFilter, setShowLostDatePickerFilter] =
    useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
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
  };

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

  return (
    <SafeAreaView className="flex-1 bg-slate-500">
      <View className="bg-slate-800 p-4 mt-10">
        <View className="flex-row gap-3">
          <Pressable onPress={() => router.replace("/Dashboard")}>
            <Ionicons name="chevron-back" color="#FFFFFF" size={24} />
          </Pressable>
          <Text className="text-white text-2xl font-bold">Plate Registry</Text>
        </View>

        <View className="mt-4">
          <TextInput
            placeholder="Search by plate or owner name"
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="bg-white rounded-md px-4 py-3 text-slate-900"
          />
        </View>

        <View className="flex-row gap-2 mt-4">
          <View className="flex-1 bg-slate-200 rounded-lg overflow-hidden ">
            <Picker
              selectedValue={statusFilter}
              onValueChange={(v) => setStatusFilter(String(v))}
            >
              {STATUS_TYPES.map((s) => (
                <Picker.Item
                  key={s}
                  label={s === "All" ? "All Status" : s}
                  value={s}
                />
              ))}
            </Picker>
          </View>

          <View className="flex-1 bg-slate-200 rounded-md overflow-hidden">
            <Picker
              selectedValue={vehicleTypeFilter}
              onValueChange={(v) => setVehicleTypeFilter(String(v))}
            >
              {VEHICLE_TYPES.map((t) => (
                <Picker.Item
                  key={t}
                  label={t === "All" ? "All Vehicle Types" : t}
                  value={t}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View className="flex-row items-center justify-between bg-white rounded-md px-3 py-3 mt-4">
          <Text className="text-slate-700 font-semibold">Lost Date</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-slate-600">{selectedDate || ""}</Text>

            <Pressable
              className="bg-slate-700 px-3 py-2 rounded-md"
              onPress={() => setShowLostDatePickerFilter(true)}
            >
              <Text className="text-white font-semibold">Pick</Text>
            </Pressable>

            <Pressable
              className="bg-gray-500 px-3 py-2 rounded-md"
              onPress={() => setSelectedDate("")}
            >
              <Text className="text-white font-semibold">Clear</Text>
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

        <View className="flex-row mt-4">
          <Pressable
            className={`flex-1 rounded-md px-4 py-3 ${loading ? "bg-gray-400" : "bg-green-500"}`}
            onPress={fetchVehicles}
            disabled={loading}
          >
            <Text className="text-white font-bold text-center">Refresh</Text>
          </Pressable>
        </View>

        <View className="mt-4">
          <Pressable
            className="rounded-md px-4 py-3 bg-orange-500"
            onPress={clearAllFilters}
          >
            <Text className="text-white font-bold text-center">
              Clear All Filters
            </Text>
          </Pressable>
        </View>

        {!!error && (
          <View className="bg-red-500 rounded-md p-3 flex-row items-start justify-between">
            <Text className="text-white flex-1">{error}</Text>
            <Pressable onPress={() => setError(null)} className="ml-3">
              <Text className="text-white font-bold">✕</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View className="flex-1 p-4">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <View className="bg-slate-800 rounded-lg p-6 flex-row items-center gap-3">
              <ActivityIndicator />
              <Text className="text-white text-lg">Loading vehicles...</Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredAndSortedVehicles}
            keyExtractor={(item) =>
              String(item.id ?? `${item.numberPlate}-${item.ownerName}`)
            }
            ListEmptyComponent={
              <View className="bg-white rounded-lg p-6">
                <Text className="text-gray-500 text-center">
                  No vehicles found. Tap “Add Vehicle” to get started.
                </Text>
              </View>
            }
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item }) => (
              <View className="bg-white rounded-lg p-4 shadow">
                <View className="flex-row items-center justify-between">
                  <Text className="text-blue-600 font-extrabold text-lg">
                    {item.numberPlate}
                  </Text>

                  <View
                    className={`px-3 py-1 rounded-full ${
                      item.status === "Found" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <Text
                      className={`font-bold text-xs ${
                        item.status === "Found"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {item.status || "—"}
                    </Text>
                  </View>
                </View>

                <View className="mt-2">
                  <Text className="text-slate-700">
                    <Text className="font-bold">Owner:</Text> {item.ownerName}
                  </Text>
                  <Text className="text-slate-700">
                    <Text className="font-bold">Type:</Text> {item.vehicleType}
                  </Text>
                  <Text className="text-slate-700">
                    <Text className="font-bold">Lost Date:</Text>{" "}
                    {item.lostDate || "—"}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
