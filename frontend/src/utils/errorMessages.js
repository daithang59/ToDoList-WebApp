/**
 * Vietnamese error message mapping
 * Maps backend error messages to user-friendly Vietnamese messages
 */

const ERROR_MESSAGES = {
  // Authentication errors
  "Invalid email or password": "Email hoặc mật khẩu không đúng",
  "Email hoặc mật khẩu không đúng": "Email hoặc mật khẩu không đúng",
  "Email already in use": "Email đã được sử dụng",
  "Email is required": "Vui lòng nhập email",
  "Password is required": "Vui lòng nhập mật khẩu",
  "Name is required": "Vui lòng nhập tên",
  "Password must be at least 8 characters long":
    "Mật khẩu phải có ít nhất 8 ký tự",

  // Account status
  "Account is locked": "Tài khoản đã bị khóa. Vui lòng thử lại sau 15 phút",
  "Tài khoản đã bị khóa do quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.":
    "Tài khoản đã bị khóa do quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút",
  "Email đã được xác thực rồi": "Email đã được xác thực rồi",

  // Token errors
  "Invalid token": "Phiên đăng nhập không hợp lệ",
  "Token has expired": "Phiên đăng nhập đã hết hạn",
  "Invalid or expired refresh token": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại",
  "Refresh token is invalid or has been revoked":
    "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại",
  "Token xác thực không hợp lệ hoặc đã hết hạn":
    "Link xác thực không hợp lệ hoặc đã hết hạn",
  "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn":
    "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",

  // Rate limiting
  "Too many requests": "Quá nhiều yêu cầu. Vui lòng thử lại sau",
  "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.":
    "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút",
  "Quá nhiều tài khoản được tạo. Vui lòng thử lại sau 1 giờ.":
    "Quá nhiều tài khoản được tạo. Vui lòng thử lại sau 1 giờ",
  "Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ.":
    "Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ",
  "Quá nhiều yêu cầu gửi email xác thực. Vui lòng thử lại sau 1 giờ.":
    "Quá nhiều yêu cầu gửi email xác thực. Vui lòng thử lại sau 1 giờ",

  // Network errors
  "Network Error": "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet",
  "Request failed": "Yêu cầu thất bại. Vui lòng thử lại",
  "Server error": "Lỗi máy chủ. Vui lòng thử lại sau",

  // Validation errors
  "Email and password are required": "Vui lòng nhập email và mật khẩu",
  "Not authenticated": "Bạn chưa đăng nhập",
  "Unauthorized": "Bạn không có quyền truy cập",

  // Guest errors
  "Guest users cannot access user profile":
    "Người dùng khách không thể truy cập trang cá nhân",
  "Only authenticated users can migrate data":
    "Chỉ người dùng đã đăng nhập mới có thể chuyển dữ liệu",

  // Default fallback
  default: "Đã xảy ra lỗi. Vui lòng thử lại",
};

/**
 * Get Vietnamese error message from error object
 * @param {Error|Object} error - Error object or axios error
 * @returns {string} Vietnamese error message
 */
export function getErrorMessage(error) {
  // If error is a string
  if (typeof error === "string") {
    return ERROR_MESSAGES[error] || error;
  }

  // Handle axios errors
  if (error.response) {
    // Server responded with error status
    const message =
      error.response.data?.message || error.response.statusText || error.message;

    return ERROR_MESSAGES[message] || message || ERROR_MESSAGES.default;
  } else if (error.request) {
    // Request was made but no response
    return ERROR_MESSAGES["Network Error"];
  } else if (error.message) {
    // Something else happened
    return ERROR_MESSAGES[error.message] || error.message;
  }

  return ERROR_MESSAGES.default;
}

/**
 * Get error code from error object
 * @param {Error|Object} error - Error object or axios error
 * @returns {string|null} Error code if available
 */
export function getErrorCode(error) {
  return error.response?.data?.code || error.code || null;
}

/**
 * Check if error is a specific type
 * @param {Error|Object} error - Error object
 * @param {string} code - Error code to check
 * @returns {boolean}
 */
export function isErrorCode(error, code) {
  return getErrorCode(error) === code;
}

/**
 * Check if error is account locked
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export function isAccountLocked(error) {
  return (
    isErrorCode(error, "ACCOUNT_LOCKED") || error.response?.status === 423
  );
}

/**
 * Check if error is rate limited
 * @param {Error|Object} error - Error object
 * @returns {boolean}
 */
export function isRateLimited(error) {
  return error.response?.status === 429;
}

/**
 * Get retry after time from rate limit error (in minutes)
 * @param {Error|Object} error - Error object
 * @returns {number|null} Minutes to wait before retrying
 */
export function getRetryAfter(error) {
  return error.response?.data?.retryAfter || null;
}

export default ERROR_MESSAGES;
