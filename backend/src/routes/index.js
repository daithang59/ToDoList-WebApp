import { Router } from "express";
import apiDocRoutes from "./apiDocRoute.js";
import appRoutes from "./appRoutes.js";
import todoRoutes from "./todoRoutes.js";

const router = Router();

// =================== MAIN API ROUTES ===================
// Todo resources - /api/todos/*
router.use("/todos", todoRoutes);

// Application routes - /api/health, /api/info
router.use("/", appRoutes);

// =================== API DOCUMENTATION ===================
// Swagger documentation - /api-docs
router.use("/api-docs", apiDocRoutes);

export default router;