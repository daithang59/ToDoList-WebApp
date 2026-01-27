import rateLimit from "express-rate-limit";

/**
 * Rate limiters for authentication endpoints
 * Protects against brute force attacks and abuse
 */

/**
 * Login rate limiter - Stricter limits to prevent brute force
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    message:
      "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.",
    code: "TOO_MANY_LOGIN_ATTEMPTS",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      message:
        "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.",
      code: "TOO_MANY_LOGIN_ATTEMPTS",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60), // minutes
    });
  },
});

/**
 * Registration rate limiter - Prevent spam registrations
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: {
    message: "Quá nhiều tài khoản được tạo. Vui lòng thử lại sau 1 giờ.",
    code: "TOO_MANY_REGISTRATIONS",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests
  handler: (req, res) => {
    res.status(429).json({
      message: "Quá nhiều tài khoản được tạo. Vui lòng thử lại sau 1 giờ.",
      code: "TOO_MANY_REGISTRATIONS",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60), // minutes
    });
  },
});

/**
 * Password reset request rate limiter
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    message:
      "Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ.",
    code: "TOO_MANY_PASSWORD_RESET_REQUESTS",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message:
        "Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ.",
      code: "TOO_MANY_PASSWORD_RESET_REQUESTS",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60), // minutes
    });
  },
});

/**
 * Email verification rate limiter
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: {
    message:
      "Quá nhiều yêu cầu gửi email xác thực. Vui lòng thử lại sau 1 giờ.",
    code: "TOO_MANY_VERIFICATION_REQUESTS",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message:
        "Quá nhiều yêu cầu gửi email xác thực. Vui lòng thử lại sau 1 giờ.",
      code: "TOO_MANY_VERIFICATION_REQUESTS",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60), // minutes
    });
  },
});

/**
 * General auth rate limiter - For other auth endpoints
 */
export const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: {
    message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
    code: "TOO_MANY_REQUESTS",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
      code: "TOO_MANY_REQUESTS",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60), // minutes
    });
  },
});
