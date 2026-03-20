import React from "react";
import { useTranslation } from "react-i18next";
import "./app/i18n";

export function App() {
  return null;
}

function AppWrapper() {
  const { i18n } = useTranslation();

  return <App key={i18n.language} />;
}

export default AppWrapper;
