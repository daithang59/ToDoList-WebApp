// src/routes/apiDocRoute.js
import { Router } from "express";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import YAML from "yamljs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Đường dẫn chính xác đến thư mục gốc của dự án khi đã deploy
const swaggerDocument = YAML.load(join(__dirname, '../docs/swagger.yaml'));

// GET /api-docs - Trả về OpenAPI specification dạng JSON
router.get("/", (req, res) => {
  res.json({
    message: "Todo API Documentation",
    openapi: swaggerDocument,
    endpoints: {
      json: "/api-docs",
      ui: "/api-docs/ui" // Có thể thêm Swagger UI sau này
    }
  });
});

export default router;
