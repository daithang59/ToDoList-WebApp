import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/auth.js";
import {
    validateLogin,
    validateMigration,
    validateRegister,
} from "../middlewares/authValidation.js";

const router = Router();

// Guest token (existing)
router.post("/guest", AuthController.issueGuestToken);

// User registration and login
router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);

// Protected routes (require authentication)
router.get("/me", authMiddleware, AuthController.getCurrentUser);
router.post(
  "/migrate-guest-data",
  authMiddleware,
  validateMigration,
  AuthController.migrateGuestData
);

export default router;
