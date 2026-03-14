import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeContextType, ThemeMode } from "../types/themeMode";
import { useColorScheme } from "react-native";
import {
  getThemeModePreference,
  setThemeModePreference,
} from "../auth/auth";
import { theme } from "./theme";

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme() === "dark" ? "dark" : "light";
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    let isMounted = true;

    const loadSavedThemeMode = async () => {
      try {
        const savedMode = await getThemeModePreference();
        if (!isMounted || !savedMode) return;

        setModeState(savedMode);
      } catch (error) {
        console.error("Failed to load theme mode preference:", error);
      }
    };

    loadSavedThemeMode();

    return () => {
      isMounted = false;
    };
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    void setThemeModePreference(nextMode).catch((error) => {
      console.error("Failed to save theme mode preference:", error);
    });
  }, []);

  const resolved = mode === "system" ? system : mode;
  const colors = useMemo(() => theme[resolved], [resolved]);
  const value = useMemo(() => ({ mode, colors, setMode }), [mode, colors, setMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
