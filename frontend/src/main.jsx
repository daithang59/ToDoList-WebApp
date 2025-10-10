import { ConfigProvider, theme as antdTheme } from "antd";
import "antd/dist/reset.css";
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function Root() {
  // lấy mặc định từ localStorage hoặc media query
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

  // Palette mới: Teal → Cyan
  const themeCfg = useMemo(
    () => ({
      // bật dark/light như bạn có sẵn
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      // Áp dụng size lớn cho toàn app
      components: {
        Switch: {
          handleSize: 20,
          trackHeight: 28,
          trackMinWidth: 54,
          innerMinMargin: 6,
          innerMaxMargin: 6,
        },
        Button: { borderRadius: 14, controlHeight: 44 },
        Input: { borderRadius: 14, controlHeight: 44 },
        Select: { borderRadius: 12, controlHeight: 42 },
        Tabs: { titleFontSize: 16 },
        Pagination: { itemSize: 40 },
      },
      token: { fontSize: 16, borderRadius: 14, colorPrimary: "#14B8A6" },
    }),
    [isDark]
  );

  return (
    <ConfigProvider theme={themeCfg} componentSize="large">
      <App
        isDark={isDark}
        onToggleDark={() => {
          document.documentElement.classList.add("theme-anim"); // <- bật transition mượt
          setIsDark((v) => !v);
          // tắt class sau 350ms
          setTimeout(
            () => document.documentElement.classList.remove("theme-anim"),
            350
          );
        }}
      />
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
