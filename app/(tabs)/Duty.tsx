// screens/DutyCalendarScreen.tsx
import { Bell, ChevronLeft, Clock, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { getOfficerDuties, getOfficerDutiesByDate } from "../../src/services/dutyService";
import type { DutyAssignment, DutyDetail } from "../../src/types/duty";

// ✅ USE THIS (your project already has this + web safe storage)
import { getUser } from "../../src/auth/auth";

interface DutyCalendarScreenProps {
  navigation: any;
  route: any;
}

type MarkedDates = Record<
  string,
  {
    marked?: boolean;
    dots?: { key: string; color: string }[];
    selected?: boolean;
    selectedColor?: string;
  }
>;

export default function DutyCalendarScreen({ navigation, route }: DutyCalendarScreenProps) {
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

  const getStatusColor = (status?: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case "Assigned":
        return styles.statusActive;
      case "Completed":
        return styles.statusCompleted;
      case "Pending":
        return styles.statusPending;
      case "Absent":
        return styles.statusAbsent;
      default:
        return styles.statusDefault;
    }
  };

  // ✅ Get officerId from route OR stored auth user (works on web too)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const fromRoute = route?.params?.officerId;
        if (fromRoute && mounted) {
          setOfficerId(String(fromRoute));
          return;
        }

        const user = await getUser(); // ✅ from src/auth/auth.ts
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

  const buildMarkedDates = (data: DutyAssignment[], keepSelectedDate?: string) => {
    const marked: MarkedDates = {};

    for (const d of data) {
      const dateKey = d.date;
      if (!dateKey) continue;

      const dot = { key: String(d.id), color: getDotColor(d.status) };

      if (!marked[dateKey]) {
        marked[dateKey] = { marked: true, dots: [dot] };
      } else {
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

      const today = new Date().toISOString().split("T")[0];
      const dateToSelect = selectedDate || today;

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
      setDutyDetails(details.map((d) => ({ ...d, status: normalizeStatus(d.status) })));
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

  const onDayPress = (day: any) => {
    const date = day.dateString;
    setSelectedDate(date);

    const newMarked: MarkedDates = { ...markedDates };
    Object.keys(newMarked).forEach((k) => {
      newMarked[k] = { ...(newMarked[k] ?? {}), selected: false };
    });

    newMarked[date] = { ...(newMarked[date] ?? {}), selected: true, selectedColor: "#1E293B" };
    setMarkedDates(newMarked);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading duties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!officerId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            Officer ID not found. Login again or pass officerId in navigation params.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Duty Calendar</Text>
        <TouchableOpacity>
          <Bell size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate || new Date().toISOString().split("T")[0]}
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
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>
            {selectedDate ? `Duty Details - ${formatDate(selectedDate)}` : "Select a date to view duties"}
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : dutyDetails.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No duties assigned for this date</Text>
            </View>
          ) : (
            dutyDetails.map((duty) => (
              <View key={duty.id} style={styles.dutyCardWrapper}>
                <View style={styles.dutyCard}>
                  <View style={styles.dutyHeader}>
                    <View style={styles.dutyHeaderLeft}>
                      <Text style={styles.dutyTitle}>
                        {duty.taskType} - {duty.location}
                      </Text>
                      <View style={styles.dutyTime}>
                        <Clock size={14} color="#94A3B8" />
                        <Text style={styles.dutyTimeText}>{duty.timeRange}</Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, getStatusColor(duty.status)]}>
                      <Text style={styles.statusText}>{String(duty.status).toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.dutyInfo}>
                    <MapPin size={14} color="#94A3B8" />
                    <Text style={styles.dutyInfoText}>{duty.location}</Text>
                  </View>

                  {!!duty.description && (
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionText}>{duty.description}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },

  scrollView: { flex: 1 },
  calendarContainer: { backgroundColor: "#0F172A", paddingHorizontal: 8, paddingBottom: 16 },

  errorBanner: {
    backgroundColor: "#991B1B",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  errorBannerText: { color: "#FEE2E2", fontSize: 12 },

  detailsSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  detailsTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 12 },

  loadingContainer: { paddingVertical: 32, alignItems: "center" },
  loadingText: { color: "#fff", marginTop: 16 },

  emptyCard: { backgroundColor: "#1E293B", borderRadius: 8, padding: 16, marginBottom: 16 },
  emptyText: { color: "#9CA3AF", textAlign: "center" },

  dutyCardWrapper: { marginBottom: 16 },
  dutyCard: { backgroundColor: "#1E293B", borderRadius: 8, padding: 16 },

  dutyHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
  dutyHeaderLeft: { flex: 1 },
  dutyTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 },

  dutyTime: { flexDirection: "row", alignItems: "center" },
  dutyTimeText: { color: "#9CA3AF", fontSize: 14, marginLeft: 4 },

  statusBadge: { borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 4 },
  statusActive: { backgroundColor: "#3B82F6" },
  statusCompleted: { backgroundColor: "#10B981" },
  statusPending: { backgroundColor: "#F59E0B" },
  statusAbsent: { backgroundColor: "#EF4444" },
  statusDefault: { backgroundColor: "#6B7280" },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "500" },

  dutyInfo: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  dutyInfoText: { color: "#D1D5DB", fontSize: 14, marginLeft: 4 },

  descriptionBox: { backgroundColor: "#334155", borderRadius: 4, padding: 8, marginTop: 8 },
  descriptionText: { color: "#D1D5DB", fontSize: 12 },

  errorText: { color: "#EF4444", fontSize: 16, textAlign: "center", paddingHorizontal: 32 },
});
