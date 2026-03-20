import { useAuth } from "@/src/hooks/useAuth";
import { Redirect } from "expo-router";
import { useTranslation } from "react-i18next";

export default function IndexRoute() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  // Wait until auth restore completes so startup route is deterministic in release builds.
  if (loading) return null;

  return <Redirect href={user ? "/Dashboard" : "/login"} />;
}
