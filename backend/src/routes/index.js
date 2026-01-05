import { Router } from "express";
import apiDocRoutes from "./apiDocRoute.js";
import appRoutes from "./appRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import projectRoutes from "./projectRoutes.js";
import todoRoutes from "./todoRoutes.js";

const router = Router();

// =================== MAIN API ROUTES ===================
// Todo resources - /api/todos/*
router.use("/todos", todoRoutes);

// Project resources - /api/projects/*
router.use("/projects", projectRoutes);

// Notification resources - /api/notifications/*
router.use("/notifications", notificationRoutes);

// Application routes - /api/health, /api/info
router.use("/", appRoutes);

// =================== API DOCUMENTATION ===================
// Swagger documentation - /api-docs
router.use("/api-docs", apiDocRoutes);

export default router;
