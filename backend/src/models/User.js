import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { generateRandomToken, hashToken } from "../utils/jwtUtils.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },
    hasMigratedGuestData: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster email lookups
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch {
    throw new Error("Password comparison failed");
  }
};

// Computed property to check if account is locked
userSchema.virtual("isLocked").get(function () {
  // Check if lockUntil exists and is in the future
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to increment login attempts and lock account if needed
userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5");
  const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account if max attempts reached
  const attemptsAfterIncrement = this.loginAttempts + 1;
  if (attemptsAfterIncrement >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME_MS };
  }

  return this.updateOne(updates);
};

// Method to reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Method to create password reset token
userSchema.methods.createPasswordResetToken = function () {
  // Generate random token
  const resetToken = generateRandomToken();

  // Hash token and save to database
  this.passwordResetToken = hashToken(resetToken);

  // Set expiration (1 hour from now)
  const expirationHours = parseInt(
    process.env.PASSWORD_RESET_EXPIRATION_HOURS || "1"
  );
  this.passwordResetExpires = Date.now() + expirationHours * 60 * 60 * 1000;

  // Return unhashed token to send to user
  return resetToken;
};

// Method to create email verification token
userSchema.methods.createEmailVerificationToken = function () {
  // Generate random token
  const verificationToken = generateRandomToken();

  // Hash token and save to database
  this.emailVerificationToken = hashToken(verificationToken);

  // Set expiration (24 hours from now)
  const expirationHours = parseInt(
    process.env.EMAIL_VERIFICATION_EXPIRATION_HOURS || "24"
  );
  this.emailVerificationExpires =
    Date.now() + expirationHours * 60 * 60 * 1000;

  // Return unhashed token to send to user
  return verificationToken;
};

// Method to convert user to JSON (exclude password and sensitive fields)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

const User = mongoose.model("User", userSchema);

export default User;
