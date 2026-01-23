import jwt from "jsonwebtoken";

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export function authMiddleware(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        message: "No token provided. Authorization header must be in format: Bearer <token>" 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured in environment variables");
      return res.status(500).json({ 
        message: "Authentication service is not configured properly" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.sub,
      role: decoded.role || "member", // 'user' for authenticated, 'member' for guest
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided, continue without user info
      return next();
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = {
      id: decoded.sub,
      role: decoded.role || "member",
    };

    next();
  } catch {
    // If token is invalid, just continue without user info
    // Don't block the request
    next();
  }
}
