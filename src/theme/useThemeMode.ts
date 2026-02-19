import { useColorScheme } from "react-native";
import { ThemeMode } from "../types/themeMode";

export function useThemeMode():ThemeMode{
    const scheme = useColorScheme();
    return scheme === "dark" ? "dark" : "light";
}