import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import appRoutes from "./appRoutes.js";
import authRoutes from "./authRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import projectRoutes from "./projectRoutes.js";
import todoRoutes from "./todoRoutes.js";

const router = Router();

// Auth Routes
router.use("/auth", authRoutes);

// API Routes
router.use("/todos", todoRoutes);
router.use("/", appRoutes);

// =================== PROTECTED ROUTES ===================
router.use(authMiddleware);
router.use("/todos", todoRoutes);
router.use("/projects", projectRoutes);
router.use("/notifications", notificationRoutes);

export default router;
