import NotificationSubscription from "../models/NotificationSubscription.js";
import Project from "../models/Project.js";
import Todo from "../models/Todo.js";
import User from "../models/User.js";

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

    // Find user and include password field
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
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
}

export default UserService;
