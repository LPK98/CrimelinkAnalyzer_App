import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { ThemeContextType, ThemeMode } from "../types/themeMode";
import { useColorScheme } from "react-native";
import { theme } from "./theme";

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme() === "dark" ? "dark" : "light";
  const [mode, setMode] = useState<ThemeMode>("system");
  const resolved = mode === "system" ? system : mode;
  const colors = useMemo(() => theme[resolved], [resolved]);
  const value = useMemo(() => ({ mode, colors, setMode }), [mode, colors]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
