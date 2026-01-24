import { Router } from "express";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/auth.js";
import appRoutes from "./appRoutes.js";
import authRoutes from "./authRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import projectRoutes from "./projectRoutes.js";
import todoRoutes from "./todoRoutes.js";

const router = Router();

// Public Routes
router.use("/auth", authRoutes);
router.use("/", appRoutes);

// Todo routes with optional auth (supports both authenticated and guest users)
router.use("/todos", optionalAuthMiddleware, todoRoutes);

// =================== PROTECTED ROUTES ===================
router.use(authMiddleware);
router.use("/projects", projectRoutes);
router.use("/notifications", notificationRoutes);

export default router;
