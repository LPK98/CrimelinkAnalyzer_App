import { images } from "@/src/constants/images";
import { useTheme } from "@/src/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Bell, Clock, MapPin, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Calendar, Calendar as RNCalendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
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
  route?: {
    params?: {
      officerId?: string | number;
    };
  };
};

export default function DutyCalendarScreen({ route }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  const [officerId, setOfficerId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
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

  const normalizeDutyStatus = useCallback((status?: string) => {
    if (!status) return "Pending";
    const normalized = String(status).toUpperCase();
    if (normalized === "ACTIVE" || normalized === "ASSIGNED") return "Assigned";
    if (normalized === "COMPLETED") return "Completed";
    if (normalized === "PENDING") return "Pending";
    if (normalized === "ABSENT") return "Absent";
    return status;
  }, []);

  const getDutyDotColor = useCallback(
    (status?: string) => {
      const normalized = normalizeDutyStatus(status);
      switch (normalized) {
        case "Assigned":
          return colors.primary;
        case "Completed":
          return "#10B981";
        case "Pending":
          return colors.accent;
        case "Absent":
          return colors.danger;
        default:
          return colors.sidebarItemMutedText;
      }
    },
    [
      colors.accent,
      colors.danger,
      colors.primary,
      colors.sidebarItemMutedText,
      normalizeDutyStatus,
    ],
  );

  const getDutyBadgePalette = (status?: string) => {
    const normalized = normalizeDutyStatus(status);
    switch (normalized) {
      case "Assigned":
        return {
          bg: "rgba(59, 130, 246, 0.2)",
          text: "#2563EB",
          border: "rgba(37, 99, 235, 0.45)",
        };
      case "Completed":
        return {
          bg: "rgba(16, 185, 129, 0.2)",
          text: "#059669",
          border: "rgba(5, 150, 105, 0.45)",
        };
      case "Pending":
        return {
          bg: "rgba(245, 158, 11, 0.2)",
          text: "#D97706",
          border: "rgba(217, 119, 6, 0.45)",
        };
      case "Absent":
        return {
          bg: "rgba(239, 68, 68, 0.2)",
          text: "#DC2626",
          border: "rgba(220, 38, 38, 0.45)",
        };
      default:
        return {
          bg: "rgba(107, 114, 128, 0.2)",
          text: colors.sidebarItemMutedText,
          border: "rgba(107, 114, 128, 0.45)",
        };
    }
  };

  const getLeaveBadgePalette = (status?: string) => {
    const normalized = String(status || "PENDING").toUpperCase();
    if (normalized === "APPROVED") {
      return {
        bg: "rgba(16, 185, 129, 0.2)",
        text: "#059669",
        border: "rgba(5, 150, 105, 0.45)",
      };
    }
    if (normalized === "DENIED") {
      return {
        bg: "rgba(239, 68, 68, 0.2)",
        text: "#DC2626",
        border: "rgba(220, 38, 38, 0.45)",
      };
    }
    return {
      bg: "rgba(245, 158, 11, 0.2)",
      text: "#D97706",
      border: "rgba(217, 119, 6, 0.45)",
    };
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

  const buildMarkedDates = useCallback(
    (data: DutyAssignment[], keepSelectedDate?: string) => {
      const marked: MarkedDates = {};

      for (const duty of data) {
        const dateKey = duty.date;
        if (!dateKey) continue;

        const dot = {
          key: `duty-${String(duty.id)}`,
          color: getDutyDotColor(duty.status),
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
          selectedColor: colors.menuSurface,
        };
      }

      return marked;
    },
    [colors.menuSurface, getDutyDotColor],
  );

  const loadMonthDuties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getOfficerDuties(officerId);
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
  }, [buildMarkedDates, officerId, selectedDate, todayKey]);

  const loadDutyDetails = useCallback(
    async (date: string) => {
      try {
        setLoading(true);
        setError(null);

        const details = await getOfficerDutiesByDate(officerId, date);
        setDutyDetails(
          details.map((duty) => ({
            ...duty,
            status: normalizeDutyStatus(duty.status),
          })),
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
    },
    [normalizeDutyStatus, officerId],
  );

  const loadMyLeaves = useCallback(async () => {
    try {
      setLoadingLeaves(true);
      const data = await leaveService.getOfficerLeaves(String(officerId));
      setLeaveRequests(data);
    } catch (e) {
      console.log("Failed to load leave requests:", e);
    } finally {
      setLoadingLeaves(false);
    }
  }, [officerId]);

  useEffect(() => {
    if (!officerId) return;
    void loadMonthDuties();
    void loadMyLeaves();
  }, [loadMonthDuties, loadMyLeaves, officerId]);

  useEffect(() => {
    if (!officerId || !selectedDate) return;
    void loadDutyDetails(selectedDate);
  }, [loadDutyDetails, officerId, selectedDate]);

  const onDayPress = (day: { dateString: string }) => {
    const date = day.dateString;
    setSelectedDate(date);

    setMarkedDates((prev) => {
      const nextMarked: MarkedDates = { ...prev };

      Object.keys(nextMarked).forEach((key) => {
        nextMarked[key] = { ...(nextMarked[key] ?? {}), selected: false };
      });

      nextMarked[date] = {
        ...(nextMarked[date] ?? {}),
        selected: true,
        selectedColor: colors.menuSurface,
      };

      return nextMarked;
    });
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
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={images.bgApp}
          style={styles.bg}
          resizeMode="cover"
        >
          <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
            <View
              style={[
                styles.centerCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.centerText, { color: colors.text }]}>
                Loading duties...
              </Text>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (!officerId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={images.bgApp}
          style={styles.bg}
          resizeMode="cover"
        >
          <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
            <View
              style={[
                styles.centerCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[styles.missingOfficerText, { color: colors.danger }]}
              >
                Officer ID not found. Login again or pass officerId in
                navigation params.
              </Text>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={images.bgApp}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.secondary,
              },
            ]}
          >
            <Pressable
              onPress={() =>
                router.canGoBack() ? router.back() : router.push("/Dashboard")
              }
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

            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Duty Calendar
            </Text>

            <TouchableOpacity
              style={[
                styles.bellButton,
                {
                  backgroundColor: colors.iconSurface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Bell size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View
              style={[
                styles.calendarCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Calendar
                current={selectedDate || todayKey}
                onDayPress={onDayPress}
                markedDates={markedDates}
                markingType="multi-dot"
                enableSwipeMonths
                theme={{
                  calendarBackground: colors.card,
                  textSectionTitleColor: colors.sidebarItemMutedText,
                  selectedDayBackgroundColor: colors.menuSurface,
                  selectedDayTextColor: colors.white,
                  todayTextColor: colors.primary,
                  dayTextColor: colors.text,
                  textDisabledColor: colors.sidebarItemMutedText,
                  monthTextColor: colors.text,
                  arrowColor: colors.primary,
                  dotColor: colors.primary,
                }}
              />
            </View>

            {!!error && (
              <View
                style={[styles.errorCard, { backgroundColor: colors.danger }]}
              >
                <Text style={[styles.errorText, { color: colors.white }]}>
                  {error}
                </Text>
              </View>
            )}

            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedDate
                  ? `Duty Details - ${formatDate(selectedDate)}`
                  : "Select a date to view duties"}
              </Text>

              {loading ? (
                <View style={styles.loaderWrap}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : dutyDetails.length === 0 ? (
                <View
                  style={[
                    styles.emptyState,
                    {
                      backgroundColor: colors.iconSurface,
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
                    No duties assigned for this date
                  </Text>
                </View>
              ) : (
                dutyDetails.map((duty) => {
                  const palette = getDutyBadgePalette(duty.status);

                  return (
                    <View
                      key={String(duty.id)}
                      style={[
                        styles.dutyCard,
                        {
                          backgroundColor: colors.iconSurface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.dutyHead,
                          { flexDirection: isCompact ? "column" : "row" },
                        ]}
                      >
                        <View style={styles.dutyHeadTextWrap}>
                          <Text
                            style={[styles.dutyTitle, { color: colors.text }]}
                          >
                            {duty.taskType} - {duty.location}
                          </Text>

                          <View style={styles.metaRow}>
                            <Clock
                              size={14}
                              color={colors.sidebarItemMutedText}
                            />
                            <Text
                              style={[
                                styles.metaRowText,
                                { color: colors.sidebarItemMutedText },
                              ]}
                            >
                              {duty.timeRange}
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: palette.bg,
                              borderColor: palette.border,
                              marginTop: isCompact ? 8 : 0,
                              alignSelf: isCompact
                                ? "flex-start"
                                : "flex-start",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              { color: palette.text },
                            ]}
                          >
                            {String(duty.status).toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.metaRow}>
                        <MapPin size={14} color={colors.sidebarItemMutedText} />
                        <Text
                          style={[
                            styles.metaRowText,
                            { color: colors.sidebarItemMutedText },
                          ]}
                        >
                          {duty.location}
                        </Text>
                      </View>

                      {!!duty.description && (
                        <View
                          style={[
                            styles.descriptionBox,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.descriptionText,
                              { color: colors.text },
                            ]}
                          >
                            {duty.description}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>

            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                My Leave Requests
              </Text>

              {loadingLeaves ? (
                <View style={styles.loaderWrap}>
                  <ActivityIndicator size="small" color={colors.accent} />
                </View>
              ) : leaveRequests.length === 0 ? (
                <View
                  style={[
                    styles.emptyState,
                    {
                      backgroundColor: colors.iconSurface,
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
                    No leave requests yet
                  </Text>
                </View>
              ) : (
                leaveRequests
                  .slice()
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((leave) => {
                    const palette = getLeaveBadgePalette(leave.status);

                    return (
                      <View
                        key={String(leave.id)}
                        style={[
                          styles.leaveCard,
                          {
                            backgroundColor: colors.iconSurface,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.leaveHeader}>
                          <Text
                            style={[styles.leaveDate, { color: colors.text }]}
                          >
                            {formatDate(leave.date)}
                          </Text>

                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: palette.bg,
                                borderColor: palette.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: palette.text },
                              ]}
                            >
                              {String(leave.status).toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={[styles.leaveReason, { color: colors.text }]}
                        >
                          Reason: {leave.reason}
                        </Text>

                        {!!leave.responseReason && (
                          <Text
                            style={[
                              styles.leaveResponse,
                              { color: colors.danger },
                            ]}
                          >
                            Response: {leave.responseReason}
                          </Text>
                        )}
                      </View>
                    );
                  })
              )}
            </View>

            <TouchableOpacity
              onPress={handleOpenLeaveModal}
              style={[
                styles.leaveRequestButton,
                { backgroundColor: colors.accent },
              ]}
            >
              <Text
                style={[styles.leaveRequestButtonText, { color: colors.white }]}
              >
                Request Leave
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ImageBackground>

      <Modal
        visible={leaveModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <View
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Request Leave
              </Text>
              <TouchableOpacity
                onPress={() => setLeaveModalVisible(false)}
                style={[
                  styles.modalClose,
                  {
                    backgroundColor: colors.iconSurface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalCalendarWrap}>
              <RNCalendar
                onDayPress={handleLeaveDateSelect}
                markedDates={
                  leaveSelectedDate
                    ? {
                        [leaveSelectedDate]: {
                          selected: true,
                          selectedColor: colors.accent,
                        },
                      }
                    : {}
                }
                minDate={todayKey}
                theme={{
                  calendarBackground: colors.card,
                  textSectionTitleColor: colors.sidebarItemMutedText,
                  selectedDayBackgroundColor: colors.accent,
                  selectedDayTextColor: colors.white,
                  todayTextColor: colors.primary,
                  dayTextColor: colors.text,
                  textDisabledColor: colors.sidebarItemMutedText,
                  monthTextColor: colors.text,
                  arrowColor: colors.accent,
                }}
              />
            </View>

            {!!leaveSelectedDate && (
              <Text
                style={[
                  styles.selectedDateText,
                  { color: colors.sidebarItemMutedText },
                ]}
              >
                Selected: {formatDate(leaveSelectedDate)}
              </Text>
            )}

            <View style={styles.reasonWrap}>
              <Text style={[styles.reasonLabel, { color: colors.text }]}>
                Reason for Leave
              </Text>
              <TextInput
                style={[
                  styles.reasonInput,
                  {
                    backgroundColor: colors.iconSurface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Enter reason..."
                placeholderTextColor={colors.sidebarItemMutedText}
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
              style={[
                styles.submitButton,
                {
                  backgroundColor:
                    submittingLeave || !leaveSelectedDate || !leaveReason.trim()
                      ? colors.sidebarItemMutedText
                      : colors.accent,
                },
              ]}
            >
              <Text style={[styles.submitButtonText, { color: colors.white }]}>
                {submittingLeave ? "Submitting..." : "Submit Request"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  centerCard: {
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  centerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  missingOfficerText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  header: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 20,
    gap: 10,
  },
  calendarCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 6,
    overflow: "hidden",
  },
  errorCard: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  loaderWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  dutyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  dutyHead: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  dutyHeadTextWrap: {
    flex: 1,
    width: "100%",
  },
  dutyTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  metaRowText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  descriptionBox: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    padding: 8,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 18,
  },
  leaveCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  leaveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  leaveDate: {
    fontSize: 14,
    fontWeight: "700",
  },
  leaveReason: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  leaveResponse: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  leaveRequestButton: {
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  leaveRequestButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 20,
    maxHeight: "88%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCalendarWrap: {
    borderRadius: 12,
    overflow: "hidden",
  },
  selectedDateText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
  },
  reasonWrap: {
    marginTop: 10,
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 98,
    fontSize: 14,
  },
  submitButton: {
    borderRadius: 12,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
