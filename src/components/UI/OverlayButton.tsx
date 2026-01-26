import { MaterialIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";

function OverlayButton({
  icon,
  size,
  iconColor,
  onPress,
}: {
  icon?: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  iconColor?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: 50,
        width: 50,
        backgroundColor: "#1A3C87",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#154172",
        zIndex: 1000,
        elevation: 1000,
      }}
    >
      <MaterialIcons name={icon} size={size} color={iconColor} />
    </Pressable>
  );
}

export default OverlayButton;
