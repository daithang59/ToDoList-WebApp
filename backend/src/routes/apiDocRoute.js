// src/routes/apiDocRoute.js
import { Router } from "express";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import YAML from "yamljs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Load YAML file and convert to JSON
const swaggerDocument = YAML.load(join(__dirname, '../docs/swagger.yaml'));

// Trả về file OpenAPI dạng JSON (hữu ích cho CI hoặc tool khác)
router.get("/", (req, res) => {
  res.json(swaggerDocument);
});

export default router;
