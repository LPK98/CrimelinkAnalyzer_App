export const theme = {
  light: {
    background: "#FFFFFF",
    text: "#000000",
    primary: "#007AFF",
    secondary: "#5856D6",
    accent: "#FF9500",
    card: "#F3F4F6",
    border: "#E5E7EB",
  },
  dark: {
    background: "#0B0C1A",
    text: "#FFFFFF",
    primary: "#0A84FF",
    secondary: "#5E5CE6",
    accent: "#FF9F0A",
    card: "#111827",
    border: "#1F2937",
  },
} as const;

export type Theme = typeof theme.light;
