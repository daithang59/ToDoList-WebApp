import { Router } from "express";
import apiDocRoutes from "./apiDocRoute.js";
import appRoutes from "./appRoutes.js";
import authRoutes from "./authRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import projectRoutes from "./projectRoutes.js";
import todoRoutes from "./todoRoutes.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// =================== PUBLIC ROUTES ===================
router.use("/auth", authRoutes);
router.use("/api-docs", apiDocRoutes);
router.use("/", appRoutes);

// =================== PROTECTED ROUTES ===================
router.use(authMiddleware);
router.use("/todos", todoRoutes);
router.use("/projects", projectRoutes);
router.use("/notifications", notificationRoutes);

export default router;
