// app/(field)/duty-calendar.tsx  (or wherever your screen lives)
import { Bell, ChevronLeft, Clock, MapPin } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

import { getUser } from "../../src/auth/auth";
import {
  getOfficerDuties,
  getOfficerDutiesByDate,
} from "../../src/services/dutyService";
import type { DutyAssignment, DutyDetail } from "../../src/types/duty";

type MarkedDates = Record<
  string,
  {
    marked?: boolean;
    dots?: { key: string; color: string }[];
    selected?: boolean;
    selectedColor?: string;
  }
>;

type Props = {
  navigation: any;
  route: any;
};

export default function DutyCalendarScreen({ navigation, route }: Props) {
  const [officerId, setOfficerId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [duties, setDuties] = useState<DutyAssignment[]>([]);
  const [dutyDetails, setDutyDetails] = useState<DutyDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeStatus = (status?: string) => {
    if (!status) return "Pending";
    const s = String(status).toUpperCase();
    if (s === "ACTIVE" || s === "ASSIGNED") return "Assigned";
    if (s === "COMPLETED") return "Completed";
    if (s === "PENDING") return "Pending";
    if (s === "ABSENT") return "Absent";
    return status;
  };

  const getDotColor = (status?: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case "Assigned":
        return "#3B82F6";
      case "Completed":
        return "#10B981";
      case "Pending":
        return "#F59E0B";
      case "Absent":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const statusBadgeClass = (status?: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case "Assigned":
        return "bg-blue-500";
      case "Completed":
        return "bg-emerald-500";
      case "Pending":
        return "bg-amber-500";
      case "Absent":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const todayKey = useMemo(() => new Date().toISOString().split("T")[0], []);

  // ✅ Get officerId from route OR stored auth user
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const fromRoute = route?.params?.officerId;
        if (fromRoute && mounted) {
          setOfficerId(String(fromRoute));
          return;
        }

        const user = await getUser();
        const id = user?.id ?? user?.userId ?? user?.officerId;
        if (id && mounted) setOfficerId(String(id));
      } catch (e) {
        console.log("OfficerId load error:", e);
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [route?.params?.officerId]);

  useEffect(() => {
    if (!officerId) return;
    loadMonthDuties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officerId]);

  useEffect(() => {
    if (!officerId || !selectedDate) return;
    loadDutyDetails(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, officerId]);

  const buildMarkedDates = (
    data: DutyAssignment[],
    keepSelectedDate?: string,
  ) => {
    const marked: MarkedDates = {};

    for (const d of data) {
      const dateKey = d.date;
      if (!dateKey) continue;

      const dot = { key: String(d.id), color: getDotColor(d.status) };

      if (!marked[dateKey]) marked[dateKey] = { marked: true, dots: [dot] };
      else
        marked[dateKey] = {
          ...marked[dateKey],
          marked: true,
          dots: [...(marked[dateKey].dots ?? []), dot],
        };
    }

    if (keepSelectedDate) {
      marked[keepSelectedDate] = {
        ...(marked[keepSelectedDate] ?? {}),
        selected: true,
        selectedColor: "#1E293B",
      };
    }

    return marked;
  };

  const loadMonthDuties = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getOfficerDuties(officerId);
      setDuties(data);

      const dateToSelect = selectedDate || todayKey;
      setMarkedDates(buildMarkedDates(data, dateToSelect));
      if (!selectedDate) setSelectedDate(dateToSelect);
    } catch (e: any) {
      const msg =
        e?.response?.status === 403
          ? "Access denied. Check backend auth / CORS."
          : "Cannot load duties. Check backend / network.";
      setError(msg);
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const loadDutyDetails = async (date: string) => {
    try {
      setLoading(true);
      setError(null);

      const details = await getOfficerDutiesByDate(officerId, date);
      setDutyDetails(
        details.map((d) => ({ ...d, status: normalizeStatus(d.status) })),
      );
    } catch (e: any) {
      const msg =
        e?.response?.status === 403
          ? "Access denied. Check backend auth / CORS."
          : "Failed to load duty details.";
      setError(msg);
      setDutyDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const onDayPress = (day: { dateString: string }) => {
    const date = day.dateString;
    setSelectedDate(date);

    const newMarked: MarkedDates = { ...markedDates };
    Object.keys(newMarked).forEach((k) => {
      newMarked[k] = { ...(newMarked[k] ?? {}), selected: false };
    });

    newMarked[date] = {
      ...(newMarked[date] ?? {}),
      selected: true,
      selectedColor: "#1E293B",
    };

    setMarkedDates(newMarked);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-white">Loading duties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!officerId) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-base text-red-500">
            Officer ID not found. Login again or pass officerId in navigation
            params.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-white">Duty Calendar</Text>

        <TouchableOpacity className="p-1">
          <Bell size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Calendar */}
        <View className="bg-slate-900 px-2 pb-4">
          <Calendar
            current={selectedDate || todayKey}
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType="multi-dot"
            enableSwipeMonths
            theme={{
              calendarBackground: "#0F172A",
              textSectionTitleColor: "#94A3B8",
              selectedDayBackgroundColor: "#1E293B",
              selectedDayTextColor: "#fff",
              todayTextColor: "#3B82F6",
              dayTextColor: "#E2E8F0",
              textDisabledColor: "#475569",
              monthTextColor: "#fff",
              arrowColor: "#3B82F6",
            }}
          />
        </View>

        {/* Error banner */}
        {error && (
          <View className="mx-4 mt-3 rounded-lg bg-red-900 px-4 py-3">
            <Text className="text-xs text-red-100">{error}</Text>
          </View>
        )}

        {/* Details */}
        <View className="px-4 pt-4 pb-8">
          <Text className="mb-3 text-base font-semibold text-white">
            {selectedDate
              ? `Duty Details - ${formatDate(selectedDate)}`
              : "Select a date to view duties"}
          </Text>

          {loading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : dutyDetails.length === 0 ? (
            <View className="mb-4 rounded-lg bg-slate-800 p-4">
              <Text className="text-center text-gray-400">
                No duties assigned for this date
              </Text>
            </View>
          ) : (
            dutyDetails.map((duty) => (
              <View key={String(duty.id)} className="mb-4">
                <View className="rounded-lg bg-slate-800 p-4">
                  <View className="mb-3 flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="mb-1 text-base font-semibold text-white">
                        {duty.taskType} - {duty.location}
                      </Text>

                      <View className="flex-row items-center">
                        <Clock size={14} color="#94A3B8" />
                        <Text className="ml-1 text-sm text-gray-400">
                          {duty.timeRange}
                        </Text>
                      </View>
                    </View>

                    <View
                      className={`rounded-full px-3 py-1 ${statusBadgeClass(duty.status)}`}
                    >
                      <Text className="text-[10px] font-medium text-white">
                        {String(duty.status).toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-2 flex-row items-center">
                    <MapPin size={14} color="#94A3B8" />
                    <Text className="ml-1 text-sm text-gray-300">
                      {duty.location}
                    </Text>
                  </View>

                  {!!duty.description && (
                    <View className="mt-2 rounded bg-slate-700 p-2">
                      <Text className="text-xs text-gray-200">
                        {duty.description}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
