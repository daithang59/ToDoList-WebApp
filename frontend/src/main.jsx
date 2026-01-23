// src/main.jsx

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { theme as antdTheme, App, ConfigProvider, message } from "antd"; // [CHANGED] Import additional 'App'
import "antd/dist/reset.css";
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import MainApp from "./App.jsx"; // [CHANGED] Rename import App to MainApp to avoid conflicts
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./index.css";
import "./styles/custom-antd.css";

message.config({
  top: 80,
  duration: 2.5,
  maxCount: 3,
});

function Root() {
  const getInitial = () => {
    const saved = localStorage.getItem("theme:dark");
    if (saved !== null) return saved === "1";
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  };
  const [isDark, setIsDark] = useState(getInitial);

  useEffect(() => {
    localStorage.setItem("theme:dark", isDark ? "1" : "0");
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
  }, [isDark]);

  const themeCfg = useMemo(
    () => ({
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: "#22c55e",
        colorTextBase: isDark ? "#E4EAF3" : "#1A202C",
        colorBgBase: isDark ? "#141824" : "#F7F8FA",
        borderRadius: 12,
        fontFamily: "'Poppins', sans-serif",
      },
      components: {
        Button: { controlHeight: 42 },
        Input: { controlHeight: 42 },
        Select: { controlHeight: 42 },
      },
    }),
    [isDark]
  );

  const toggleDarkTheme = () => {
    document.documentElement.classList.add("theme-anim");
    setIsDark((v) => !v);
    setTimeout(
      () => document.documentElement.classList.remove("theme-anim"),
      350
    );
  };

  return (
    <ConfigProvider theme={themeCfg}>
      {/* [CHANGED] Wrap your application in Ant Design's <App> */}
      <App>
        <AuthProvider>
          <MainApp isDark={isDark} onToggleDark={toggleDarkTheme} />
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </App>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
