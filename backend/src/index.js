import process from "process";
import createApp from "./app.js";
import { connectDB } from "./config/db.js";
import emailService from "./services/EmailService.js";
import { startReminderScheduler } from "./services/reminderScheduler.js";

const app = createApp();

const PORT = process.env.PORT || 4000;

console.log("\n🚀 Starting TodoList Backend Server...");
console.log("📋 Environment Configuration:");
console.log("  NODE_ENV:", process.env.NODE_ENV || "development");
console.log("  PORT:", PORT);
console.log(
  "  MONGODB_URI:",
  process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, "//***:***@") || "Not set"
);
console.log("");

connectDB(process.env.MONGODB_URI)
  .then(async () => {
    // Initialize email service
    await emailService.initialize();

    app.listen(PORT, () => {
      console.log("✅ Server started successfully!");
      console.log(`🌐 Server running at: http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔗 API Endpoint: http://localhost:${PORT}/api`);
      console.log("\n✨ Ready to accept requests!\n");
    });
    startReminderScheduler();
  })
  .catch((err) => {
    console.error("Failed to connect DB:", err?.message || err);
    process.exit(1);
  });
