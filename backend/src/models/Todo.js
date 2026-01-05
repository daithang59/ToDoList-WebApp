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
    order: { type: Number, default: 0 },
    deadline: { type: Date, default: null },
    important: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    subtasks: [subtaskSchema],
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Todo" }],
    recurrence: {
      enabled: { type: Boolean, default: false },
      interval: { type: Number, default: 1 },
      unit: { type: String, enum: ["day", "week", "month"], default: "day" },
      until: { type: Date, default: null },
    },
    reminder: {
      enabled: { type: Boolean, default: false },
      minutesBefore: { type: Number, default: 60 },
      channels: [{ type: String, enum: ["email", "push"] }],
      email: { type: String, trim: true, default: "" },
      lastNotifiedAt: { type: Date, default: null },
    },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    ownerId: { type: String, trim: true },
    sharedWith: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default mongoose.model("Todo", todoSchema);
