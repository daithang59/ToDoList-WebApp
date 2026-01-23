const COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

class ProjectValidation {
  static validateCreateProject(req, res, next) {
    const { name, description, color, sharedWith } = req.body;
    const errors = [];

    if (!name || typeof name !== "string" || !name.trim()) {
      errors.push({
        field: "name",
        message: "Project name is required",
      });
    } else if (name.trim().length > 120) {
      errors.push({
        field: "name",
        message: "Project name must be less than 120 characters",
      });
    }

    if (description !== undefined && typeof description !== "string") {
      errors.push({
        field: "description",
        message: "Description must be a string",
      });
    }

    if (color !== undefined && color && !COLOR_REGEX.test(color)) {
      errors.push({
        field: "color",
        message: "Color must be a valid hex code",
      });
    }

    if (sharedWith !== undefined) {
      if (!Array.isArray(sharedWith)) {
        errors.push({
          field: "sharedWith",
          message: "SharedWith must be an array",
        });
      } else if (sharedWith.some((email) => !isValidEmail(email))) {
        errors.push({
          field: "sharedWith",
          message: "SharedWith must contain valid emails",
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    return next();
  }

  static validateUpdateProject(req, res, next) {
    const { name, description, color, sharedWith } = req.body;
    const errors = [];

    if (name !== undefined) {
      if (!name || typeof name !== "string" || !name.trim()) {
        errors.push({
          field: "name",
          message: "Project name must be a non-empty string",
        });
      } else if (name.trim().length > 120) {
        errors.push({
          field: "name",
          message: "Project name must be less than 120 characters",
        });
      }
    }

    if (description !== undefined && typeof description !== "string") {
      errors.push({
        field: "description",
        message: "Description must be a string",
      });
    }

    if (color !== undefined && color && !COLOR_REGEX.test(color)) {
      errors.push({
        field: "color",
        message: "Color must be a valid hex code",
      });
    }

    if (sharedWith !== undefined) {
      if (!Array.isArray(sharedWith)) {
        errors.push({
          field: "sharedWith",
          message: "SharedWith must be an array",
        });
      } else if (sharedWith.some((email) => !isValidEmail(email))) {
        errors.push({
          field: "sharedWith",
          message: "SharedWith must contain valid emails",
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    return next();
  }
}

export default ProjectValidation;
