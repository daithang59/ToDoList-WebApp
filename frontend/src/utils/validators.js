/**
 * Client-side validation utilities
 */

/**
 * Validate email format
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password strength requirements
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

/**
 * Get password strength score (0-5)
 * 0 = empty, 1 = very weak, 2 = weak, 3 = medium, 4 = strong, 5 = very strong
 */
export function getPasswordStrength(password) {
  if (!password) return 0;

  let strength = 0;

  // Length check
  if (password.length >= PASSWORD_REQUIREMENTS.minLength) strength++;
  if (password.length >= 12) strength++; // Bonus for longer passwords

  // Character variety checks
  if (PASSWORD_REQUIREMENTS.requireUppercase && /[A-Z]/.test(password)) {
    strength++;
  }
  if (PASSWORD_REQUIREMENTS.requireLowercase && /[a-z]/.test(password)) {
    strength++;
  }
  if (PASSWORD_REQUIREMENTS.requireNumber && /[0-9]/.test(password)) {
    strength++;
  }
  if (
    PASSWORD_REQUIREMENTS.requireSpecialChar &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    strength++;
  }

  return Math.min(strength, 5);
}

/**
 * Get password strength label and color
 */
export function getPasswordStrengthInfo(password) {
  const strength = getPasswordStrength(password);

  const info = {
    0: { label: "", color: "gray" },
    1: { label: "Rất yếu", color: "#dc3545" },
    2: { label: "Yếu", color: "#fd7e14" },
    3: { label: "Trung bình", color: "#ffc107" },
    4: { label: "Mạnh", color: "#28a745" },
    5: { label: "Rất mạnh", color: "#20c997" },
  };

  return info[strength];
}

/**
 * Validate password and return detailed feedback
 */
export function validatePassword(password) {
  const errors = [];

  if (!password) {
    return { valid: false, errors: ["Mật khẩu không được để trống"] };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Mật khẩu phải có ít nhất ${PASSWORD_REQUIREMENTS.minLength} ký tự`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ hoa");
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ thường");
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 số");
  }

  if (
    PASSWORD_REQUIREMENTS.requireSpecialChar &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    errors.push("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check password criteria (for displaying checkmarks)
 */
export function checkPasswordCriteria(password) {
  return {
    length: password.length >= PASSWORD_REQUIREMENTS.minLength,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

/**
 * Validate name
 */
export function validateName(name) {
  if (!name || !name.trim()) {
    return { valid: false, error: "Tên không được để trống" };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: "Tên phải có ít nhất 2 ký tự" };
  }

  if (name.trim().length > 100) {
    return { valid: false, error: "Tên không được vượt quá 100 ký tự" };
  }

  return { valid: true };
}

/**
 * Validate confirm password
 */
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return { valid: false, error: "Vui lòng xác nhận mật khẩu" };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: "Mật khẩu xác nhận không khớp" };
  }

  return { valid: true };
}
