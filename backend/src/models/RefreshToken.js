import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    createdByIp: {
      type: String,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedByIp: {
      type: String,
      default: null,
    },
    replacedByToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for automatic deletion of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient queries
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });

/**
 * Check if token is expired
 * @returns {boolean}
 */
refreshTokenSchema.methods.isExpired = function () {
  return Date.now() >= this.expiresAt.getTime();
};

/**
 * Check if token is active (not expired and not revoked)
 * @returns {boolean}
 */
refreshTokenSchema.methods.isActive = function () {
  return !this.revokedAt && !this.isExpired();
};

/**
 * Revoke this token
 * @param {string} ipAddress - IP address that revoked the token
 * @param {string} replacementToken - Token that replaced this one (optional)
 */
refreshTokenSchema.methods.revoke = function (ipAddress, replacementToken) {
  this.revokedAt = new Date();
  this.revokedByIp = ipAddress;
  if (replacementToken) {
    this.replacedByToken = replacementToken;
  }
};

/**
 * Static method to revoke all tokens for a user
 * @param {string} userId - User ID
 * @param {string} ipAddress - IP address
 */
refreshTokenSchema.statics.revokeAllForUser = async function (
  userId,
  ipAddress
) {
  return this.updateMany(
    { userId, revokedAt: null },
    {
      $set: {
        revokedAt: new Date(),
        revokedByIp: ipAddress,
      },
    }
  );
};

/**
 * Static method to find active token
 * @param {string} token - Refresh token
 * @returns {Promise<RefreshToken|null>}
 */
refreshTokenSchema.statics.findActiveToken = async function (token) {
  return this.findOne({
    token,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
};

/**
 * Static method to clean up expired and revoked tokens older than 30 days
 */
refreshTokenSchema.statics.cleanupOldTokens = async function () {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: thirtyDaysAgo } },
      { revokedAt: { $lt: thirtyDaysAgo } },
    ],
  });
};

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
