import { Theme } from "../theme/theme";

export type ThemeMode = "light" | "dark" | "system";

export type ThemeContextType = {
  mode: ThemeMode;
  colors: Theme;
  setMode: (mode: ThemeMode) => void;
};
