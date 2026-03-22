import WeaponListItem from "@/src/components/WeaponListItem";
import { images } from "@/src/constants/images";
import { useTheme } from "@/src/theme/ThemeProvider";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import { SafeAreaView } from "react-native-safe-area-context";

const BulletRequest = () => {
  const { colors } = useTheme();
  const REQUEST_LIMIT = 20;
  const [roundsRequested, setRoundsRequested] = useState(0);

  const remainingRounds = useMemo(
    () => Math.max(REQUEST_LIMIT - roundsRequested, 0),
    [roundsRequested],
  );

  const remainingProgress = useMemo(
    () => remainingRounds / REQUEST_LIMIT,
    [remainingRounds, REQUEST_LIMIT],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        style={styles.bg}
        source={images.bgApp}
        resizeMode="cover"
      >
        <View style={[styles.container, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.headerCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Pressable
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.push("/(screens)/Weapon")
              }
              style={[
                styles.backButton,
                {
                  backgroundColor: colors.iconSurface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="chevron-back" color={colors.text} size={22} />
            </Pressable>

            <View style={styles.headerTextWrap}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Ammunition Request
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text }]}>
                Select rounds and submit your ammo request.
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.summaryTextWrap}>
                <Text style={[styles.summaryLabel, { color: colors.primary }]}>
                  Request Limit
                </Text>
                <View style={styles.limitRow}>
                  <Text style={[styles.limitCount, { color: colors.text }]}>
                    {remainingRounds}
                  </Text>
                  <Text style={[styles.limitSuffix, { color: colors.text }]}>
                    rounds remaining
                  </Text>
                </View>
              </View>

              <Progress.Circle
                size={56}
                progress={remainingProgress}
                color={colors.primary}
                indeterminate={false}
                showsText
                formatText={() => `${Math.round(remainingProgress * 100)}%`}
                textStyle={{ color: colors.text, fontWeight: "700" }}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.white }]}>
              Select Weapon
            </Text>
            <WeaponListItem name="AK-47" imageUrl={images.profile} />

            <View
              style={[
                styles.sliderCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sliderTitle, { color: colors.text }]}>
                Ammunition Count
              </Text>
              <View style={styles.roundsRow}>
                <Text style={[styles.roundsValue, { color: colors.text }]}>
                  {roundsRequested}
                </Text>
                <Text style={[styles.roundsUnit, { color: colors.text }]}>
                  ROUNDS
                </Text>
              </View>

              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={REQUEST_LIMIT}
                step={1}
                value={roundsRequested}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                onValueChange={(value) => setRoundsRequested(value)}
              />

              <View style={styles.sliderRangeRow}>
                <Text style={[styles.rangeText, { color: colors.text }]}>
                  0
                </Text>
                <Text style={[styles.rangeText, { color: colors.text }]}>
                  {REQUEST_LIMIT}
                </Text>
              </View>
            </View>

            <Pressable
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={() => console.log("Submit bullet request")}
            >
              <Text style={[styles.submitButtonText, { color: colors.white }]}>
                Submit Request
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  headerCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    opacity: 0.75,
  },
  scroll: {
    flex: 1,
    marginTop: 14,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryLabel: {
    fontWeight: "600",
    fontSize: 16,
  },
  limitRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 4,
  },
  limitCount: {
    fontSize: 32,
    fontWeight: "800",
  },
  limitSuffix: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.85,
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 4,
    fontSize: 18,
    fontWeight: "700",
  },
  sliderCard: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sliderTitle: {
    fontWeight: "700",
    fontSize: 17,
  },
  roundsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "baseline",
    marginTop: 8,
  },
  roundsValue: {
    fontSize: 34,
    fontWeight: "800",
  },
  roundsUnit: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
  },
  slider: {
    marginTop: 4,
    marginBottom: 6,
  },
  sliderRangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rangeText: {
    fontSize: 14,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default BulletRequest;
