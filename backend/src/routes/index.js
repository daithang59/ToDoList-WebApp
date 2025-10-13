import { Router } from "express";
import apiDocRoutes from "./apiDocRoute.js";
import appRoutes from "./appRoutes.js";
import todoRoutes from "./todoRoutes.js";

const router = Router();

// API Routes
router.use("/todos", todoRoutes);
router.use("/", appRoutes);

// API Documentation Routes
router.use("/", apiDocRoutes);

export default router;