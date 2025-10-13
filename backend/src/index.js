import cors from "cors";
import dotenv from "dotenv";
import express from "express";
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

// Tạo đường dẫn tuyệt đối
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerDocument = YAML.load(join(__dirname, "docs", "swagger.yaml"));

dotenv.config();

const app = express();

// Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

// API Routes
app.use("/api", apiRoutes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 handler cho routes không tồn tại
app.use(AppController.notFound);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Debug environment variables
console.log('🔍 Environment variables:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   PORT:', process.env.PORT);
console.log('   MONGODB_URI:', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@'));

// Kết nối DB rồi mới start server (có catch lỗi)
connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📖 API Documentation available at http://localhost:${PORT}/api-docs`);

  })
  .catch((err) => {
    console.error("❌ Failed to connect DB:", err?.message || err);
    process.exit(1);
  });
