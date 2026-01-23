import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    color: { type: String, default: "#22c55e" },
    // Owner fields - support both guest and authenticated users
    ownerId: { type: String, trim: true, sparse: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      index: true,
    },
    sharedWith: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

projectSchema.index({ ownerId: 1, createdAt: -1 });
projectSchema.index({ sharedWith: 1, createdAt: -1 });
projectSchema.index({ ownerId: 1, name: 1 });

export default mongoose.model("Project", projectSchema);
