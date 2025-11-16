import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    host: true,
    port: 8080,
    allowedHosts: [
      "todolist-frontend-route-todo-webapp.apps.okd.hldthang.io.vn",
    ],
  },
});
