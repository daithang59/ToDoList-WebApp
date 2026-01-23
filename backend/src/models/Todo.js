import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    order: { type: Number, default: 0 },
    deadline: { type: Date, default: null },
    important: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    // Owner fields - support both guest and authenticated users
    ownerId: {
      type: String,
      trim: true,
      sparse: true, // Allow null values with index
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    // Additional fields from frontend
    order: { type: Number, default: 0 },
    subtasks: [
      {
        id: String,
        title: String,
        completed: { type: Boolean, default: false },
      },
    ],
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Todo" }],
    recurrence: {
      enabled: { type: Boolean, default: false },
      interval: { type: Number, default: 1 },
      unit: {
        type: String,
        enum: ["day", "week", "month", "year"],
        default: "day",
      },
      until: { type: Date, default: null },
    },
    reminder: {
      enabled: { type: Boolean, default: false },
      minutesBefore: { type: Number, default: 60 },
      channels: [{ type: String, enum: ["push", "email"] }],
      email: { type: String, default: "" },
      lastNotifiedAt: { type: Date, default: null },
    },
    completedAt: { type: Date, default: null },
    syncStatus: {
      type: String,
      enum: ["synced", "pending", "error"],
      default: "synced",
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
todoSchema.index({ ownerId: 1, createdAt: -1 });
todoSchema.index({ userId: 1, createdAt: -1 });
todoSchema.index({ completed: 1 });
todoSchema.index({ important: 1 });
todoSchema.index({ deadline: 1 });
todoSchema.index({ projectId: 1 });

// Validation: Either ownerId or userId must be present
todoSchema.pre("validate", function (next) {
  if (!this.ownerId && !this.userId) {
    next(new Error("Either ownerId or userId must be provided"));
  } else {
    next();
  }
});

export default mongoose.model("Todo", todoSchema);
