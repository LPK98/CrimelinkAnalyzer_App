import Ionicons from "@expo/vector-icons/build/Ionicons";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "react-native-paper";
import { useTheme } from "../theme/ThemeProvider";

export type WeaponCardProps = {
  name: string;
  status: string;
  ammoCount: number;
  totalAmmo: number;
  dueDate: string;
};

const WeaponCard = ({
  name,
  status,
  ammoCount,
  totalAmmo,
  dueDate,
}: WeaponCardProps) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const today = new Date();
  const dueDateObj = new Date(dueDate);
  const isOverdue = dueDateObj < today;

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
      <View>
        <Image
          source={{ uri: "../../assets/images/logo.png" }}
          style={{ width: 150, height: 150 }}
        />
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          gap: 5,
          paddingVertical: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 5,
          }}
        >
          <Text
            style={{ color: colors.text, fontWeight: "bold", fontSize: 18 }}
          >
            {name}
          </Text>
          <View
            style={{
              backgroundColor: colors.primaryAccent,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 10,
              borderColor: colors.primary,
              borderWidth: 1,
            }}
          >
            <Text style={{ color: colors.primary, fontWeight: "bold" }}>
              {status}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: colors.text, fontSize: 16, marginBottom: 5 }}>
            AMMUNITION
          </Text>
          <Text style={{ color: colors.text, fontSize: 14, marginBottom: 5 }}>
            {ammoCount}/{totalAmmo} RDS
          </Text>
        </View>
        <ProgressBar
          style={{ marginBottom: 15 }}
          progress={0.5}
          color={colors.primary}
        />
        <View style={styles.container}>
          <View style={styles.line} />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignContent: "center",
            marginTop: 10,
          }}
        >
          <Text style={{ color: isOverdue ? colors.danger : colors.text }}>
            {`Due Date: ${dueDate}`}
          </Text>
          <Pressable onPress={() => console.log("Open details")}>
            <Ionicons name="chevron-forward" color={colors.text} size={24} />
          </Pressable>
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
    borderBottomColor: "black",
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: "100%",
  },
});

export default WeaponCard;
