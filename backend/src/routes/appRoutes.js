import { Router } from "express";
import AppController from "../controllers/AppController.js";

const router = Router();

// GET /api/health - Health check endpoint
router.get("/health", AppController.healthCheck);

// GET /api/info - API information
router.get("/info", AppController.getApiInfo);

export default router;