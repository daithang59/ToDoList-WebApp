/**
 * Validation middleware for authentication endpoints
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
const PASSWORD_MIN_LENGTH = 8;

/**
 * Validate registration request
 */
export function validateRegister(req, res, next) {
  const { email, password, name } = req.body;
  const errors = [];

  // Validate name
  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters long" });
  } else if (name.trim().length > 100) {
    errors.push({ field: "name", message: "Name cannot exceed 100 characters" });
  }

  // Validate email
  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: "email", message: "Please provide a valid email address" });
  }

  // Validate password
  if (!password || typeof password !== "string") {
    errors.push({ field: "password", message: "Password is required" });
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push({ 
      field: "password", 
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` 
    });
  }

  // Check for password complexity (optional but recommended)
  if (password && password.length >= PASSWORD_MIN_LENGTH) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!(hasUpperCase || hasLowerCase) || !hasNumber) {
      errors.push({
        field: "password",
        message: "Password must contain letters and numbers"
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors
    });
  }

  next();
}

/**
 * Validate login request
 */
export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  }

  // Validate password
  if (!password || typeof password !== "string") {
    errors.push({ field: "password", message: "Password is required" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors
    });
  }

  next();
}

/**
 * Validate guest data migration request
 */
export function validateMigration(req, res, next) {
  const { guestOwnerId } = req.body;
  const errors = [];

  // Validate guestOwnerId
  if (!guestOwnerId || typeof guestOwnerId !== "string" || !guestOwnerId.trim()) {
    errors.push({ field: "guestOwnerId", message: "Guest owner ID is required" });
  } else if (guestOwnerId.trim().length > 128) {
    errors.push({ field: "guestOwnerId", message: "Invalid guest owner ID" });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors
    });
  }

  next();
}
