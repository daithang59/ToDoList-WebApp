import mongoose from "mongoose";

const notificationSubscriptionSchema = new mongoose.Schema(
  {
    // Owner fields - support both guest and authenticated users
    ownerId: { type: String, trim: true, sparse: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    subscription: { type: Object, required: true },
  },
  { timestamps: true }
);

notificationSubscriptionSchema.index({ ownerId: 1 });
notificationSubscriptionSchema.index(
  { ownerId: 1, "subscription.endpoint": 1 },
  { unique: true }
);

export default mongoose.model(
  "NotificationSubscription",
  notificationSubscriptionSchema
);
