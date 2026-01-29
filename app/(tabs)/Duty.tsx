import { Bell, ChevronLeft, Clock, MapPin, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, Calendar as RNCalendar } from "react-native-calendars";

import { getUser } from "../../src/auth/auth";
import {
  getOfficerDuties,
  getOfficerDutiesByDate,
} from "../../src/services/dutyService";
import * as leaveService from "../../src/services/leaveService";
import type { DutyAssignment, DutyDetail } from "../../src/types/duty";
import type { LeaveRequest } from "../../src/types/leave";

type MarkedDates = Record<
  string,
  {
    marked?: boolean;
    dots?: { key: string; color: string }[];
    selected?: boolean;
    selectedColor?: string;
    dotColor?: string;
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

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [leaveSelectedDate, setLeaveSelectedDate] = useState<string>("");
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const normalizeDutyStatus = (status?: string) => {
    if (!status) return "Pending";
    const s = String(status).toUpperCase();
    if (s === "ACTIVE" || s === "ASSIGNED") return "Assigned";
    if (s === "COMPLETED") return "Completed";
    if (s === "PENDING") return "Pending";
    if (s === "ABSENT") return "Absent";
    return status;
  };

  const getDutyDotColor = (status?: string) => {
    const s = normalizeDutyStatus(status);
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

  const dutyBadgeClass = (status?: string) => {
    const s = normalizeDutyStatus(status);
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

  const leaveBadgeClass = (status?: string) => {
    const s = String(status || "PENDING").toUpperCase();
    if (s === "APPROVED") return "bg-emerald-600";
    if (s === "DENIED") return "bg-red-600";
    return "bg-amber-600"; // PENDING
  };

  const todayKey = useMemo(() => new Date().toISOString().split("T")[0], []);

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
    loadMyLeaves();
  }, [officerId]);

  useEffect(() => {
    if (!officerId || !selectedDate) return;
    loadDutyDetails(selectedDate);
  }, [selectedDate, officerId]);

  //  ONLY duty dots
  const buildMarkedDates = (
    data: DutyAssignment[],
    keepSelectedDate?: string,
  ) => {
    const marked: MarkedDates = {};

    for (const d of data) {
      const dateKey = d.date;
      if (!dateKey) continue;

      const dot = {
        key: `duty-${String(d.id)}`,
        color: getDutyDotColor(d.status),
      };

      if (!marked[dateKey]) marked[dateKey] = { marked: true, dots: [dot] };
      else {
        marked[dateKey] = {
          ...marked[dateKey],
          marked: true,
          dots: [...(marked[dateKey].dots ?? []), dot],
        };
      }
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

      //  build calendar marks only from duties
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
        details.map((d) => ({ ...d, status: normalizeDutyStatus(d.status) })),
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

  const loadMyLeaves = async () => {
    try {
      setLoadingLeaves(true);
      const data = await leaveService.getOfficerLeaves(String(officerId));
      setLeaveRequests(data);
    } catch (e) {
      console.log("Failed to load leave requests:", e);
    } finally {
      setLoadingLeaves(false);
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

  const handleOpenLeaveModal = () => {
    setLeaveModalVisible(true);
    setLeaveSelectedDate("");
    setLeaveReason("");
  };

  const handleLeaveDateSelect = (day: { dateString: string }) => {
    setLeaveSelectedDate(day.dateString);
  };

  const handleSubmitLeaveRequest = async () => {
    if (!leaveSelectedDate) {
      Alert.alert("Error", "Please select a date");
      return;
    }

    if (!leaveReason.trim()) {
      Alert.alert("Error", "Please provide a reason for leave");
      return;
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(leaveSelectedDate);
    if (selectedDateObj < today) {
      Alert.alert("Error", "Cannot request leave for past dates");
      return;
    }

    try {
      setSubmittingLeave(true);

      await leaveService.submitLeaveRequest({
        officerId: String(officerId),
        date: leaveSelectedDate,
        reason: leaveReason.trim(),
      });

      Alert.alert("Success", "Leave request submitted successfully");
      setLeaveModalVisible(false);
      setLeaveSelectedDate("");
      setLeaveReason("");

      // Reload duties and leave list (calendar remains duty dots only)
      await loadMonthDuties();
      await loadMyLeaves();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Failed to submit leave request";
      Alert.alert("Error", msg);
    } finally {
      setSubmittingLeave(false);
    }
  };

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

        {error && (
          <View className="mx-4 mt-3 rounded-lg bg-red-900 px-4 py-3">
            <Text className="text-xs text-red-100">{error}</Text>
          </View>
        )}

        <View className="px-4 pt-4 pb-4">
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
                      className={`rounded-full px-3 py-1 ${dutyBadgeClass(duty.status)}`}
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

        <View className="px-4 pb-6">
          <Text className="mb-3 text-base font-semibold text-white">
            My Leave Requests
          </Text>

          {loadingLeaves ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#F59E0B" />
            </View>
          ) : leaveRequests.length === 0 ? (
            <View className="rounded-lg bg-slate-800 p-4">
              <Text className="text-center text-gray-400">
                No leave requests yet
              </Text>
            </View>
          ) : (
            leaveRequests
              .slice()
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map((l) => (
                <View
                  key={String(l.id)}
                  className="mb-3 rounded-lg bg-slate-800 p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-white">
                      {formatDate(l.date)}
                    </Text>

                    <View
                      className={`rounded-full px-3 py-1 ${leaveBadgeClass(l.status)}`}
                    >
                      <Text className="text-[10px] font-medium text-white">
                        {String(l.status).toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-2 text-xs text-gray-300">
                    Reason: {l.reason}
                  </Text>

                  {!!l.responseReason && (
                    <Text className="mt-2 text-xs text-red-200">
                      Response: {l.responseReason}
                    </Text>
                  )}
                </View>
              ))
          )}
        </View>

        <View className="px-4 pb-8">
          <TouchableOpacity
            onPress={handleOpenLeaveModal}
            className="rounded-lg bg-amber-600 py-4 shadow-lg"
          >
            <Text className="text-center text-base font-semibold text-white">
              Request Leave
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={leaveModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="mt-auto rounded-t-3xl bg-slate-900 px-4 pt-6 pb-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-white">
                Request Leave
              </Text>
              <TouchableOpacity onPress={() => setLeaveModalVisible(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <RNCalendar
                onDayPress={handleLeaveDateSelect}
                markedDates={{
                  [leaveSelectedDate]: {
                    selected: true,
                    selectedColor: "#F59E0B",
                  },
                }}
                minDate={new Date().toISOString().split("T")[0]}
                theme={{
                  calendarBackground: "#0F172A",
                  textSectionTitleColor: "#94A3B8",
                  selectedDayBackgroundColor: "#F59E0B",
                  selectedDayTextColor: "#fff",
                  todayTextColor: "#3B82F6",
                  dayTextColor: "#E2E8F0",
                  textDisabledColor: "#475569",
                  monthTextColor: "#fff",
                  arrowColor: "#F59E0B",
                }}
              />
            </View>

            {leaveSelectedDate && (
              <Text className="mb-2 text-sm text-gray-400">
                Selected: {formatDate(leaveSelectedDate)}
              </Text>
            )}

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-white">
                Reason for Leave
              </Text>
              <TextInput
                className="rounded-lg bg-slate-800 px-4 py-3 text-white"
                placeholder="Enter reason..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={leaveReason}
                onChangeText={setLeaveReason}
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmitLeaveRequest}
              disabled={
                submittingLeave || !leaveSelectedDate || !leaveReason.trim()
              }
              className={`rounded-lg py-4 ${
                submittingLeave || !leaveSelectedDate || !leaveReason.trim()
                  ? "bg-gray-600"
                  : "bg-amber-600"
              }`}
            >
              <Text className="text-center text-base font-semibold text-white">
                {submittingLeave ? "Submitting..." : "Submit Request"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
