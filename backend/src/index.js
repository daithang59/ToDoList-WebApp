import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { dirname, join } from "path"; // Sửa dòng nàyimport swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import YAML from "yamljs";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import apiDocRoute from "./routes/apiDocRoute.js"; // <-- file vừa tạo
import todoRouter from "./routes/todoRoutes.js";


// THÊM 2 DÒNG NÀY ĐỂ TẠO ĐƯỜNG DẪN TUYỆT ĐỐI
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerDocument = YAML.load(join(__dirname, "docs", "swagger.yaml"));

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is healthy" });
});

// API chính
app.use("/api/todos", todoRouter);

// Xuất JSON spec (tuỳ chọn)
app.use("/api-docs.json", apiDocRoute);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

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
