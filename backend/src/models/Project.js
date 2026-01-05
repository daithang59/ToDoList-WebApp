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

export default mongoose.model("Project", projectSchema);
