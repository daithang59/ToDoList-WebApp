import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/auth.js";
import {
    validateLogin,
    validateMigration,
    validateRegister,
} from "../middlewares/authValidation.js";
import {
    emailVerificationLimiter,
    generalAuthLimiter,
    loginLimiter,
    passwordResetLimiter,
    registerLimiter,
} from "../middlewares/rateLimiters.js";

const router = Router();

// Guest token (existing)
router.post("/guest", generalAuthLimiter, AuthController.issueGuestToken);

// User registration and login (with rate limiting)
router.post(
  "/register",
  registerLimiter,
  validateRegister,
  AuthController.register
);
router.post("/login", loginLimiter, validateLogin, AuthController.login);

// Token management
router.post("/refresh", generalAuthLimiter, AuthController.refreshToken);
router.post("/logout", generalAuthLimiter, AuthController.logout);

// Password reset flow
router.post(
  "/forgot-password",
  passwordResetLimiter,
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  AuthController.resetPassword
);

// Email verification
router.post("/verify-email", generalAuthLimiter, AuthController.verifyEmail);
router.post(
  "/resend-verification",
  authMiddleware,
  emailVerificationLimiter,
  AuthController.resendVerificationEmail
);

// Protected routes (require authentication)
router.get("/me", authMiddleware, AuthController.getCurrentUser);
router.post(
  "/migrate-guest-data",
  authMiddleware,
  validateMigration,
  AuthController.migrateGuestData
);

export default router;
