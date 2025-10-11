// src/main.jsx

import { ConfigProvider, theme as antdTheme } from "antd";
import "antd/dist/reset.css";
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

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
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const themeCfg = useMemo(
    () => ({
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        // --- ĐỔI MÀU CHỦ ĐẠO TẠI ĐÂY ---
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
    setTimeout(() => 
      document.documentElement.classList.remove("theme-anim"), 350
    );
  };

  return (
    <ConfigProvider theme={themeCfg}>
      <App isDark={isDark} onToggleDark={toggleDarkTheme} />
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);