import Project from "../models/Project.js";

class ProjectService {
  static sanitizeSharedWith(values) {
    if (!Array.isArray(values)) return [];
    const seen = new Set();
    return values
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean)
      .filter((value) => {
        const key = value.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  static async getProjects({ ownerId, sharedWith } = {}) {
    const filter = {};
    const conditions = [];

    if (ownerId) {
      conditions.push({ ownerId });
    }
    if (sharedWith) {
      conditions.push({ sharedWith });
    }

    if (conditions.length) {
      filter.$or = conditions;
    }

    return Project.find(filter).sort({ createdAt: -1 });
  }

  static async createProject(data) {
    if (!data?.name?.trim()) {
      throw new Error("Project name is required");
    }

    const project = await Project.create({
      name: data.name.trim(),
      description: data.description?.trim() || "",
      color: data.color || "#22c55e",
      ownerId: typeof data.ownerId === "string" ? data.ownerId.trim() : undefined,
      sharedWith: this.sanitizeSharedWith(data.sharedWith),
    });

    return project;
  }

  static async getProjectById(id) {
    const project = await Project.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  }

  static async updateProject(id, data) {
    const updates = {};

    if (data.name !== undefined) {
      if (!data.name?.trim()) {
        throw new Error("Project name cannot be empty");
      }
      updates.name = data.name.trim();
    }

    if (data.description !== undefined) {
      updates.description = data.description?.trim() || "";
    }

    if (data.color !== undefined) {
      updates.color = data.color || "#22c55e";
    }

    if (data.ownerId !== undefined) {
      updates.ownerId =
        typeof data.ownerId === "string" ? data.ownerId.trim() : undefined;
    }

    if (data.sharedWith !== undefined) {
      updates.sharedWith = this.sanitizeSharedWith(data.sharedWith);
    }

    const project = await Project.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  }

  static async deleteProject(id) {
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  }
}

export default ProjectService;
