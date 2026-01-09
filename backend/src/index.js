import process from "process";
import { connectDB } from "./config/db.js";
import createApp from "./app.js";
import { startReminderScheduler } from "./services/reminderScheduler.js";

const app = createApp();

const PORT = process.env.PORT || 4000;

console.log("Environment variables:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  PORT:", process.env.PORT);
console.log(
  "  MONGODB_URI:",
  process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, "//***:***@")
);

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(
      `API Documentation available at http://localhost:${PORT}/api-docs`
    );
    startReminderScheduler();
  })
  .catch((err) => {
    console.error("Failed to connect DB:", err?.message || err);
    process.exit(1);
  });
