import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    color: { type: String, default: "#22c55e" },
    ownerId: { type: String, trim: true },
    sharedWith: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

projectSchema.index({ ownerId: 1, createdAt: -1 });
projectSchema.index({ sharedWith: 1, createdAt: -1 });
projectSchema.index({ ownerId: 1, name: 1 });

export default mongoose.model("Project", projectSchema);
