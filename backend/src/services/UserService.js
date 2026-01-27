import NotificationSubscription from "../models/NotificationSubscription.js";
import Project from "../models/Project.js";
import Todo from "../models/Todo.js";
import User from "../models/User.js";
import { hashToken } from "../utils/jwtUtils.js";

/**
 * UserService - Business logic for user operations
 */
class UserService {
  /**
   * Create a new user account
   */
  static async createUser(userData) {
    const { email, password, name } = userData;

    // Validate input
    if (!email?.trim()) {
      throw new Error("Email is required");
    }
    if (!password) {
      throw new Error("Password is required");
    }
    if (!name?.trim()) {
      throw new Error("Name is required");
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (existingUser) {
      const error = new Error("Email already in use");
      error.status = 409;
      throw error;
    }

    // Password validation
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password,
      name: name.trim(),
    });

    return user;
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticateUser(email, password) {
    if (!email?.trim() || !password) {
      throw new Error("Email and password are required");
    }

    // Find user and include password and lock fields
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password +loginAttempts +lockUntil");

    if (!user) {
      const error = new Error("Email hoặc mật khẩu không đúng");
      error.status = 401;
      throw error;
    }

    // Check if account is locked
    if (user.isLocked) {
      const error = new Error(
        "Tài khoản đã bị khóa do quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút."
      );
      error.status = 423; // 423 Locked
      error.code = "ACCOUNT_LOCKED";
      throw error;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incrementLoginAttempts();

      const error = new Error("Email hoặc mật khẩu không đúng");
      error.status = 401;
      throw error;
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return user;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    return user;
  }

  /**
   * Migrate guest data to user account
   */
  static async migrateGuestData(userId, guestOwnerId) {
    if (!userId || !guestOwnerId) {
      throw new Error("User ID and guest owner ID are required");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    // Check if migration already done
    if (user.hasMigratedGuestData) {
      const error = new Error("Guest data has already been migrated for this account");
      error.status = 409;
      throw error;
    }

    // Migrate todos
    const todosResult = await Todo.updateMany(
      { ownerId: guestOwnerId, userId: { $exists: false } },
      {
        $set: { userId },
        $unset: { ownerId: "" },
      }
    );

    // Migrate projects
    const projectsResult = await Project.updateMany(
      { ownerId: guestOwnerId, userId: { $exists: false } },
      {
        $set: { userId },
        $unset: { ownerId: "" },
      }
    );

    // Migrate notification subscriptions
    const subsResult = await NotificationSubscription.updateMany(
      { ownerId: guestOwnerId, userId: { $exists: false } },
      {
        $set: { userId },
        $unset: { ownerId: "" },
      }
    );

    // Mark migration as complete
    user.hasMigratedGuestData = true;
    await user.save();

    return {
      migratedTodos: todosResult.modifiedCount,
      migratedProjects: projectsResult.modifiedCount,
      migratedSubscriptions: subsResult.modifiedCount,
    };
  }

  /**
   * Verify user email with token
   */
  static async verifyUserEmail(token) {
    if (!token?.trim()) {
      throw new Error("Verification token is required");
    }

    const hashedToken = hashToken(token);

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error(
        "Token xác thực không hợp lệ hoặc đã hết hạn"
      );
      error.status = 400;
      error.code = "INVALID_VERIFICATION_TOKEN";
      throw error;
    }

    // Mark email as verified and clear token
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return user;
  }

  /**
   * Initiate password reset - Generate token
   */
  static async initiatePasswordReset(email) {
    if (!email?.trim()) {
      throw new Error("Email is required");
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      // Don't reveal that user doesn't exist
      // Return success to prevent email enumeration
      return null;
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    return { user, resetToken };
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token, newPassword) {
    if (!token?.trim()) {
      throw new Error("Reset token is required");
    }
    if (!newPassword) {
      throw new Error("New password is required");
    }
    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const hashedToken = hashToken(token);

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      const error = new Error(
        "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
      );
      error.status = 400;
      error.code = "INVALID_RESET_TOKEN";
      throw error;
    }

    // Update password and clear token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // Also reset login attempts in case account was locked
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    return user;
  }
}
