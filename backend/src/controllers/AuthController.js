import RefreshToken from "../models/RefreshToken.js";
import emailService from "../services/EmailService.js";
import UserService from "../services/UserService.js";
import {
    generateAccessToken,
    generateRefreshToken,
    getTokenExpiration,
    verifyToken
} from "../utils/jwtUtils.js";
import BaseController from "./BaseController.js";

const normalizeClientId = (value) =>
  typeof value === "string" ? value.trim() : "";

/**
 * Get client IP address from request
 */
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

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

    const token = generateAccessToken(clientId, "member");
    const expiresAt = getTokenExpiration(token);

    res.json({
      token,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
      expiresAt: expiresAt?.toISOString(),
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

    // Generate verification token and send email
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email (don't wait for it)
    emailService
      .sendVerificationEmail(user, verificationToken)
      .catch((error) => {
        console.error("Failed to send verification email:", error);
      });

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), "user");
    const refreshToken = generateRefreshToken(user._id.toString());

    // Save refresh token to database
    const refreshExpiration = getTokenExpiration(refreshToken);
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: refreshExpiration,
      createdByIp: getClientIp(req),
    });

    res.status(201).json({
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
      expiresAt: getTokenExpiration(accessToken)?.toISOString(),
      user: user.toJSON(),
      message:
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
    });
  });

  /**
   * Login with email and password
   */
  static login = BaseController.asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Authenticate user
    const user = await UserService.authenticateUser(email, password);

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), "user");
    const refreshToken = generateRefreshToken(user._id.toString());

    // Save refresh token to database
    const refreshExpiration = getTokenExpiration(refreshToken);
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: refreshExpiration,
      createdByIp: getClientIp(req),
    });

    res.json({
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
      expiresAt: getTokenExpiration(accessToken)?.toISOString(),
      user: user.toJSON(),
    });
  });

  /**
   * Refresh access token using refresh token
   */
  static refreshToken = BaseController.asyncHandler(async (req, res) => {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Verify token signature
    let decoded;
    try {
      decoded = verifyToken(token, "refresh");
    } catch {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Check if token exists in database and is active
    const refreshToken = await RefreshToken.findActiveToken(token);

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token is invalid or has been revoked",
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(decoded.sub, "user");

    // Optionally: Implement refresh token rotation
    // Generate new refresh token and revoke old one
    const newRefreshToken = generateRefreshToken(decoded.sub);
    const newRefreshExpiration = getTokenExpiration(newRefreshToken);

    // Revoke old token
    refreshToken.revoke(getClientIp(req), newRefreshToken);
    await refreshToken.save();

    // Create new refresh token
    await RefreshToken.create({
      userId: decoded.sub,
      token: newRefreshToken,
      expiresAt: newRefreshExpiration,
      createdByIp: getClientIp(req),
    });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || "15m",
      expiresAt: getTokenExpiration(accessToken)?.toISOString(),
    });
  });

  /**
   * Logout - Revoke refresh token
   */
  static logout = BaseController.asyncHandler(async (req, res) => {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Find and revoke token
    const refreshToken = await RefreshToken.findOne({ token });

    if (refreshToken && !refreshToken.revokedAt) {
      refreshToken.revoke(getClientIp(req));
      await refreshToken.save();
    }

    res.json({ message: "Đăng xuất thành công" });
  });

  /**
   * Forgot password - Send reset email
   */
  static forgotPassword = BaseController.asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await UserService.initiatePasswordReset(email);

    // Always return success to prevent email enumeration
    if (result) {
      // Send email (don't wait for it)
      emailService
        .sendPasswordResetEmail(result.user, result.resetToken)
        .catch((error) => {
          console.error("Failed to send password reset email:", error);
        });
    }

    res.json({
      message:
        "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
    });
  });

  /**
   * Reset password with token
   */
  static resetPassword = BaseController.asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const user = await UserService.resetPassword(token, password);

    // Revoke all existing refresh tokens for security
    await RefreshToken.revokeAllForUser(
      user._id.toString(),
      getClientIp(req)
    );

    // Send confirmation email
    emailService.sendPasswordChangedEmail(user).catch((error) => {
      console.error("Failed to send password changed email:", error);
    });

    res.json({
      message: "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.",
    });
  });

  /**
   * Verify email with token
   */
  static verifyEmail = BaseController.asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const user = await UserService.verifyUserEmail(token);

    res.json({
      message: "Email đã được xác thực thành công!",
      user: user.toJSON(),
    });
  });

  /**
   * Resend verification email
   */
  static resendVerificationEmail = BaseController.asyncHandler(
    async (req, res) => {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await UserService.getUserById(userId);

      if (user.isEmailVerified) {
        return res.status(400).json({ message: "Email đã được xác thực rồi" });
      }

      // Generate new verification token
      const verificationToken = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      // Send verification email
      await emailService.sendVerificationEmail(user, verificationToken);

      res.json({
        message: "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.",
      });
    }
  );

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
      return res
        .status(401)
        .json({ message: "Guest users cannot access user profile" });
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
      return res
        .status(401)
        .json({ message: "Only authenticated users can migrate data" });
    }

    if (!guestOwnerId?.trim()) {
      return res.status(400).json({ message: "guestOwnerId is required" });
    }

    const result = await UserService.migrateGuestData(
      userId,
      guestOwnerId.trim()
    );

    res.json({
      message: "Guest data migrated successfully",
      ...result,
    });
  });
}

export default AuthController;
