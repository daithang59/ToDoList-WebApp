import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    deadline: { type: Date, default: null },
    important: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    // Thêm các trường khác nếu cần
  },
  { timestamps: true }
);

export default mongoose.model("Todo", todoSchema);
