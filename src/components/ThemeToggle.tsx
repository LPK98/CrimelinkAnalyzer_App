import { Pressable, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export default function ThemeToggle() {
  const { mode, setMode, colors } = useTheme();

  const Item = ({ value }: { value: "light" | "dark" | "system" }) => (
    <Pressable
      onPress={() => setMode(value)}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: mode === value ? colors.card : "transparent",
      }}
    >
      <Text style={{ color: colors.text }}>{value.toUpperCase()}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Item value="system" />
        <Item value="light" />
        <Item value="dark" />
      </View>
    </View>
  );
}
