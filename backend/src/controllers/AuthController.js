import jwt from "jsonwebtoken";
import UserService from "../services/UserService.js";
import BaseController from "./BaseController.js";

const normalizeClientId = (value) =>
  typeof value === "string" ? value.trim() : "";

class AuthController extends BaseController {
  /**
   * Issue guest token (existing functionality)
   */
  static issueGuestToken = BaseController.asyncHandler(async (req, res) => {
    const clientId = normalizeClientId(req.body?.clientId);
    if (!clientId) {
      return res.status(400).json({ message: "clientId is required" });
    }
    if (clientId.length > 128) {
      return res.status(400).json({ message: "clientId is too long" });
    }

    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET is not configured");
      error.status = 500;
      throw error;
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "30d";
    const token = jwt.sign(
      { sub: clientId, role: "member" },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    const decoded = jwt.decode(token);
    const expiresAt =
      decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null;

    res.json({
      token,
      tokenType: "Bearer",
      expiresIn,
      expiresAt,
      ownerId: clientId,
    });
  });

  /**
   * Register a new user account
   */
  static register = BaseController.asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    // Create user
    const user = await UserService.createUser({ email, password, name });

    // Generate JWT token for the new user
    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET is not configured");
      error.status = 500;
      throw error;
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "30d";
    const token = jwt.sign(
      { sub: user._id.toString(), role: "user" },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    const decoded = jwt.decode(token);
    const expiresAt =
      decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null;

    res.status(201).json({
      token,
      tokenType: "Bearer",
      expiresIn,
      expiresAt,
      user: user.toJSON(),
    });
  });

  /**
   * Login with email and password
   */
  static login = BaseController.asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.body;

    // Authenticate user
    const user = await UserService.authenticateUser(email, password);

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET is not configured");
      error.status = 500;
      throw error;
    }

    // Set expiration based on rememberMe option
    const expiresIn = rememberMe ? "90d" : process.env.JWT_EXPIRES_IN || "30d";
    const token = jwt.sign(
      { sub: user._id.toString(), role: "user" },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    const decoded = jwt.decode(token);
    const expiresAt =
      decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : null;

    res.json({
      token,
      tokenType: "Bearer",
      expiresIn,
      expiresAt,
      user: user.toJSON(),
    });
  });

  /**
   * Get current authenticated user
   */
  static getCurrentUser = BaseController.asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Check if user is authenticated (not guest)
    if (req.user?.role !== "user") {
      return res.status(401).json({ message: "Guest users cannot access user profile" });
    }

    const user = await UserService.getUserById(userId);
    res.json({ user: user.toJSON() });
  });

  /**
   * Migrate guest data to user account
   */
  static migrateGuestData = BaseController.asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { guestOwnerId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Check if user is authenticated (not guest)
    if (req.user?.role !== "user") {
      return res.status(401).json({ message: "Only authenticated users can migrate data" });
    }

    if (!guestOwnerId?.trim()) {
      return res.status(400).json({ message: "guestOwnerId is required" });
    }

    const result = await UserService.migrateGuestData(userId, guestOwnerId.trim());

    res.json({
      message: "Guest data migrated successfully",
      ...result,
    });
  });
}

export default AuthController;

