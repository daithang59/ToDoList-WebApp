import { Router } from "express";
import apiDocRoutes from "./apiDocRoute.js";
import appRoutes from "./appRoutes.js";
import authRoutes from "./authRoutes.js";
import todoRoutes from "./todoRoutes.js";

const router = Router();

// Auth Routes
router.use("/auth", authRoutes);

// API Routes
router.use("/todos", todoRoutes);
router.use("/", appRoutes);

// API Documentation Routes
router.use("/", apiDocRoutes);

export default router;