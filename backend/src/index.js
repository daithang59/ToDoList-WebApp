import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { dirname, join } from "path";
import process from "process";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import YAML from "yamljs";
import { connectDB } from "./config/db.js";
import AppController from "./controllers/AppController.js";
import { errorHandler } from "./middlewares/error.js";
import apiRoutes from "./routes/index.js";
import { startReminderScheduler } from "./services/reminderScheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerDocument = YAML.load(join(__dirname, "docs", "swagger.yaml"));

dotenv.config();

const app = express();

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8080",
];

const parseOrigins = (value) =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const rawOrigins = process.env.CORS_ORIGIN || "";
const allowAllOrigins = rawOrigins === "*";
const allowedOrigins =
  rawOrigins && !allowAllOrigins ? parseOrigins(rawOrigins) : DEFAULT_ALLOWED_ORIGINS;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowAllOrigins) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

app.use("/api", apiRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(AppController.notFound);
app.use(errorHandler);

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
