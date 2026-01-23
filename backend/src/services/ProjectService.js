import Project from "../models/Project.js";

const normalizeMemberId = (value) =>
  typeof value === "string" ? value.trim() : "";

const buildMemberFilter = (memberId) =>
  memberId
    ? { $or: [{ ownerId: memberId }, { sharedWith: memberId }] }
    : {};

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

  static async getProjects({ memberId } = {}) {
    const normalizedMemberId = normalizeMemberId(memberId);
    const filter = buildMemberFilter(normalizedMemberId);
    return Project.find(filter).sort({ createdAt: -1 });
  }

  static async createProject(data, memberId) {
    const ownerId = normalizeMemberId(memberId);
    if (!ownerId) {
      throw new Error("OwnerId is required");
    }
    if (!data?.name?.trim()) {
      throw new Error("Project name is required");
    }

    const project = await Project.create({
      name: data.name.trim(),
      description: data.description?.trim() || "",
      color: data.color || "#22c55e",
      ownerId,
      sharedWith: this.sanitizeSharedWith(data.sharedWith),
    });

    return project;
  }

  static async getProjectById(id, memberId) {
    const normalizedMemberId = normalizeMemberId(memberId);
    const filter = buildMemberFilter(normalizedMemberId);
    const project = await Project.findOne({ _id: id, ...filter });
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  }

  static async updateProject(id, data, memberId) {
    const ownerId = normalizeMemberId(memberId);
    if (!ownerId) {
      throw new Error("OwnerId is required");
    }
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

    if (data.sharedWith !== undefined) {
      updates.sharedWith = this.sanitizeSharedWith(data.sharedWith);
    }

    const project = await Project.findOneAndUpdate(
      { _id: id, ownerId },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  }

  static async deleteProject(id, memberId) {
    const ownerId = normalizeMemberId(memberId);
    if (!ownerId) {
      throw new Error("OwnerId is required");
    }

    const project = await Project.findOneAndDelete({ _id: id, ownerId });
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  }
}

export default ProjectService;
