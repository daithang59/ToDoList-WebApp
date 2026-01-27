import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * JWT Utilities for centralized token management
 */

/**
 * Generate access token (short-lived)
 * @param {string} userId - User ID
 * @param {string} role - User role ('user' or 'member')
 * @returns {string} JWT access token
 */
export function generateAccessToken(userId, role = "user") {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const expiresIn = process.env.JWT_ACCESS_EXPIRATION || "15m";

  return jwt.sign({ sub: userId, role }, process.env.JWT_SECRET, {
    expiresIn,
  });
}

/**
 * Generate refresh token (long-lived)
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
export function generateRefreshToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const expiresIn = process.env.JWT_REFRESH_EXPIRATION || "7d";

  return jwt.sign({ sub: userId, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn,
  });
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @param {string} expectedType - Expected token type ('access' or 'refresh')
 * @returns {object} Decoded token payload
 */
export function verifyToken(token, expectedType = null) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If expectedType is specified, validate it
    if (expectedType === "refresh" && decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    throw error;
  }
}

/**
 * Decode token without verification (for getting expiration)
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
export function decodeToken(token) {
  return jwt.decode(token);
}

/**
 * Generate random token for email verification or password reset
 * @param {number} bytes - Number of random bytes (default: 32)
 * @returns {string} Random hex token
 */
export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Hash token for secure storage
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Get token expiration date
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null if not found
 */
export function getTokenExpiration(token) {
  const decoded = decodeToken(token);
  return decoded?.exp ? new Date(decoded.exp * 1000) : null;
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
export function isTokenExpired(token) {
  const expiration = getTokenExpiration(token);
  return expiration ? expiration < new Date() : true;
}

/**
 * Validate JWT_SECRET exists
 * @throws {Error} If JWT_SECRET is not configured
 */
export function validateJWTSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in environment variables");
  }
}
