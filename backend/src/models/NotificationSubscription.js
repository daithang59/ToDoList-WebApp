import mongoose from "mongoose";

const notificationSubscriptionSchema = new mongoose.Schema(
  {
    ownerId: { type: String, trim: true, required: true },
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
