import Ionicons from "@expo/vector-icons/build/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export type WeaponRequestCardProps = {
  weaponSerial: string;
  ammoCount: number;
  status: string;
  requestNote?: string;
  requestedAt?: string | Date;
  resolvedAt?: string | Date;
};

const WeaponRequestCard = ({
  weaponSerial,
  ammoCount,
  status,
  requestNote,
  requestedAt,
  resolvedAt,
}: WeaponRequestCardProps) => {
  const { colors } = useTheme();
  const normalizedStatus = status?.toUpperCase() ?? "PENDING";
  const statusColor =
    normalizedStatus === "APPROVED"
      ? colors.primary
      : normalizedStatus === "REJECTED"
        ? (colors.danger ?? "#FF3B30")
        : colors.accent;

  const formatDate = (value?: string | Date) => {
    if (!value) return "N/A";

    const parsedDate = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return typeof value === "string" ? value : "N/A";
    }

    return parsedDate.toLocaleDateString();
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        padding: 10,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        marginTop: 10,
        width: "100%",
      }}
    >
      <View
        style={{
          width: 68,
          height: 68,
          borderRadius: 18,
          backgroundColor: colors.primaryAccent ?? colors.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name="document-text-outline"
          size={30}
          color={colors.primary}
        />
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: "column",
          gap: 8,
          paddingVertical: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
            gap: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: colors.text, fontWeight: "bold", fontSize: 18 }}
              numberOfLines={1}
            >
              {weaponSerial}
            </Text>
            <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13 }}>
              Firearm Request
            </Text>
          </View>

          <View
            style={{
              backgroundColor: `${statusColor}1A`,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 10,
              borderColor: statusColor,
              borderWidth: 1,
            }}
          >
            <Text style={{ color: statusColor, fontWeight: "bold" }}>
              {normalizedStatus}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: colors.text, fontSize: 16, marginBottom: 5 }}>
            REQUESTED AMMO
          </Text>
          <Text style={{ color: colors.text, fontSize: 14, marginBottom: 5 }}>
            {ammoCount} RDS
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 12,
              fontWeight: "700",
              marginBottom: 4,
            }}
          >
            REQUEST NOTE
          </Text>
          <Text style={{ color: colors.text, fontSize: 14 }} numberOfLines={2}>
            {requestNote?.trim() || "No request note provided."}
          </Text>
        </View>

        <View style={styles.container}>
          <View style={[styles.line, { borderBottomColor: colors.border }]} />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, opacity: 0.7, fontSize: 12 }}>
              Requested On
            </Text>
            <Text style={{ color: colors.text, marginTop: 2 }}>
              {formatDate(requestedAt)}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={{ color: colors.text, opacity: 0.7, fontSize: 12 }}>
              {normalizedStatus === "PENDING" ? "Current State" : "Resolved On"}
            </Text>
            <Text
              style={{
                color:
                  normalizedStatus === "REJECTED"
                    ? (colors.danger ?? "#FF3B30")
                    : colors.text,
                marginTop: 2,
                textAlign: "right",
              }}
            >
              {normalizedStatus === "PENDING"
                ? "Awaiting review"
                : formatDate(resolvedAt)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  line: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "100%",
  },
});

export default WeaponRequestCard;
