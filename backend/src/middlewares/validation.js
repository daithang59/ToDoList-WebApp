/**
 * Validation middleware cho Todo routes
 */
const STATUS_VALUES = new Set(["todo", "in_progress", "done"]);
const RECURRENCE_UNITS = new Set(["day", "week", "month"]);
const REMINDER_CHANNELS = new Set(["email", "push"]);
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

class TodoValidation {
  /**
   * Validate dữ liệu khi tạo todo mới
   */
  static validateCreateTodo(req, res, next) {
    const {
      title,
      deadline,
      tags,
      status,
      subtasks,
      dependencies,
      projectId,
      recurrence,
      reminder,
      sharedWith,
      order,
      ownerId,
    } = req.body;
    const errors = [];

    // Validate title
    if (!title || typeof title !== 'string' || !title.trim()) {
      errors.push({
        field: 'title',
        message: 'Title is required and must be a non-empty string'
      });
    } else if (title.trim().length > 200) {
      errors.push({
        field: 'title',
        message: 'Title must be less than 200 characters'
      });
    }

    // Validate deadline
    if (deadline !== undefined && deadline !== null) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        errors.push({
          field: 'deadline',
          message: 'Deadline must be a valid date'
        });
      }
    }

    // Validate tags
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        errors.push({
          field: 'tags',
          message: 'Tags must be an array'
        });
      } else {
        for (let i = 0; i < tags.length; i++) {
          if (typeof tags[i] !== 'string' || tags[i].trim().length === 0) {
            errors.push({
              field: 'tags',
              message: 'All tags must be non-empty strings'
            });
            break;
          }
          if (tags[i].trim().length > 50) {
            errors.push({
              field: 'tags',
              message: 'Each tag must be less than 50 characters'
            });
            break;
          }
        }
      }
    }

    if (status !== undefined && !STATUS_VALUES.has(status)) {
      errors.push({
        field: "status",
        message: "Status must be todo, in_progress, or done",
      });
    }

    if (order !== undefined && !Number.isFinite(Number(order))) {
      errors.push({
        field: "order",
        message: "Order must be a number",
      });
    }

    if (subtasks !== undefined) {
      if (!Array.isArray(subtasks)) {
        errors.push({
          field: "subtasks",
          message: "Subtasks must be an array",
        });
      } else {
        for (const subtask of subtasks) {
          if (!subtask?.title || typeof subtask.title !== "string") {
            errors.push({
              field: "subtasks",
              message: "Each subtask must have a title",
            });
            break;
          }
        }
      }
    }

    if (dependencies !== undefined) {
      if (!Array.isArray(dependencies)) {
        errors.push({
          field: "dependencies",
          message: "Dependencies must be an array",
        });
      } else if (dependencies.some((id) => !objectIdRegex.test(id))) {
        errors.push({
          field: "dependencies",
          message: "Dependencies must contain valid IDs",
        });
      }
    }

    if (projectId !== undefined && projectId !== null) {
      if (!objectIdRegex.test(projectId)) {
        errors.push({
          field: "projectId",
          message: "Project ID must be a valid ID",
        });
      }
    }

    if (recurrence !== undefined) {
      if (typeof recurrence !== "object") {
        errors.push({
          field: "recurrence",
          message: "Recurrence must be an object",
        });
      } else {
        if (
          recurrence.interval !== undefined &&
          (!Number.isFinite(Number(recurrence.interval)) ||
            Number(recurrence.interval) < 1)
        ) {
          errors.push({
            field: "recurrence.interval",
            message: "Recurrence interval must be >= 1",
          });
        }
        if (
          recurrence.unit !== undefined &&
          !RECURRENCE_UNITS.has(recurrence.unit)
        ) {
          errors.push({
            field: "recurrence.unit",
            message: "Recurrence unit must be day, week, or month",
          });
        }
        if (recurrence.until !== undefined && recurrence.until !== null) {
          const untilDate = new Date(recurrence.until);
          if (isNaN(untilDate.getTime())) {
            errors.push({
              field: "recurrence.until",
              message: "Recurrence until must be a valid date",
            });
          }
        }
      }
    }

    if (reminder !== undefined) {
      if (typeof reminder !== "object") {
        errors.push({
          field: "reminder",
          message: "Reminder must be an object",
        });
      } else {
        if (
          reminder.minutesBefore !== undefined &&
          (!Number.isFinite(Number(reminder.minutesBefore)) ||
            Number(reminder.minutesBefore) < 1)
        ) {
          errors.push({
            field: "reminder.minutesBefore",
            message: "Reminder minutes must be >= 1",
          });
        }
        if (
          reminder.channels !== undefined &&
          (!Array.isArray(reminder.channels) ||
            reminder.channels.some((c) => !REMINDER_CHANNELS.has(c)))
        ) {
          errors.push({
            field: "reminder.channels",
            message: "Reminder channels must be email or push",
          });
        }
        if (reminder.email !== undefined && reminder.email !== "") {
          if (!isValidEmail(reminder.email)) {
            errors.push({
              field: "reminder.email",
              message: "Reminder email must be valid",
            });
          }
        }
      }
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

    if (ownerId !== undefined) {
      if (typeof ownerId !== "string" || !ownerId.trim()) {
        errors.push({
          field: "ownerId",
          message: "OwnerId must be a non-empty string",
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    next();
  }

  /**
   * Validate dữ liệu khi cập nhật todo
   */
  static validateUpdateTodo(req, res, next) {
    const {
      title,
      deadline,
      tags,
      description,
      status,
      subtasks,
      dependencies,
      projectId,
      recurrence,
      reminder,
      sharedWith,
      order,
      ownerId,
    } = req.body;
    const errors = [];

    // Validate title (optional)
    if (title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        errors.push({
          field: 'title',
          message: 'Title must be a non-empty string'
        });
      } else if (title.trim().length > 200) {
        errors.push({
          field: 'title',
          message: 'Title must be less than 200 characters'
        });
      }
    }

    // Validate description (optional)
    if (description !== undefined) {
      if (typeof description !== 'string') {
        errors.push({
          field: 'description',
          message: 'Description must be a string'
        });
      } else if (description.length > 1000) {
        errors.push({
          field: 'description',
          message: 'Description must be less than 1000 characters'
        });
      }
    }

    // Validate deadline (optional)
    if (deadline !== undefined && deadline !== null) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        errors.push({
          field: 'deadline',
          message: 'Deadline must be a valid date'
        });
      }
    }

    // Validate tags (optional)
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        errors.push({
          field: 'tags',
          message: 'Tags must be an array'
        });
      } else {
        for (let i = 0; i < tags.length; i++) {
          if (typeof tags[i] !== 'string' || tags[i].trim().length === 0) {
            errors.push({
              field: 'tags',
              message: 'All tags must be non-empty strings'
            });
            break;
          }
          if (tags[i].trim().length > 50) {
            errors.push({
              field: 'tags',
              message: 'Each tag must be less than 50 characters'
            });
            break;
          }
        }
      }
    }

    if (status !== undefined && !STATUS_VALUES.has(status)) {
      errors.push({
        field: "status",
        message: "Status must be todo, in_progress, or done",
      });
    }

    if (order !== undefined && !Number.isFinite(Number(order))) {
      errors.push({
        field: "order",
        message: "Order must be a number",
      });
    }

    if (subtasks !== undefined) {
      if (!Array.isArray(subtasks)) {
        errors.push({
          field: "subtasks",
          message: "Subtasks must be an array",
        });
      } else {
        for (const subtask of subtasks) {
          if (subtask?.title !== undefined && typeof subtask.title !== "string") {
            errors.push({
              field: "subtasks",
              message: "Each subtask must have a title",
            });
            break;
          }
        }
      }
    }

    if (dependencies !== undefined) {
      if (!Array.isArray(dependencies)) {
        errors.push({
          field: "dependencies",
          message: "Dependencies must be an array",
        });
      } else if (dependencies.some((id) => !objectIdRegex.test(id))) {
        errors.push({
          field: "dependencies",
          message: "Dependencies must contain valid IDs",
        });
      }
    }

    if (projectId !== undefined && projectId !== null) {
      if (!objectIdRegex.test(projectId)) {
        errors.push({
          field: "projectId",
          message: "Project ID must be a valid ID",
        });
      }
    }

    if (recurrence !== undefined) {
      if (typeof recurrence !== "object") {
        errors.push({
          field: "recurrence",
          message: "Recurrence must be an object",
        });
      } else {
        if (
          recurrence.interval !== undefined &&
          (!Number.isFinite(Number(recurrence.interval)) ||
            Number(recurrence.interval) < 1)
        ) {
          errors.push({
            field: "recurrence.interval",
            message: "Recurrence interval must be >= 1",
          });
        }
        if (
          recurrence.unit !== undefined &&
          !RECURRENCE_UNITS.has(recurrence.unit)
        ) {
          errors.push({
            field: "recurrence.unit",
            message: "Recurrence unit must be day, week, or month",
          });
        }
        if (recurrence.until !== undefined && recurrence.until !== null) {
          const untilDate = new Date(recurrence.until);
          if (isNaN(untilDate.getTime())) {
            errors.push({
              field: "recurrence.until",
              message: "Recurrence until must be a valid date",
            });
          }
        }
      }
    }

    if (reminder !== undefined) {
      if (typeof reminder !== "object") {
        errors.push({
          field: "reminder",
          message: "Reminder must be an object",
        });
      } else {
        if (
          reminder.minutesBefore !== undefined &&
          (!Number.isFinite(Number(reminder.minutesBefore)) ||
            Number(reminder.minutesBefore) < 1)
        ) {
          errors.push({
            field: "reminder.minutesBefore",
            message: "Reminder minutes must be >= 1",
          });
        }
        if (
          reminder.channels !== undefined &&
          (!Array.isArray(reminder.channels) ||
            reminder.channels.some((c) => !REMINDER_CHANNELS.has(c)))
        ) {
          errors.push({
            field: "reminder.channels",
            message: "Reminder channels must be email or push",
          });
        }
        if (reminder.email !== undefined && reminder.email !== "") {
          if (!isValidEmail(reminder.email)) {
            errors.push({
              field: "reminder.email",
              message: "Reminder email must be valid",
            });
          }
        }
      }
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

    if (ownerId !== undefined) {
      if (typeof ownerId !== "string" || !ownerId.trim()) {
        errors.push({
          field: "ownerId",
          message: "OwnerId must be a non-empty string",
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    next();
  }

  /**
   * Validate query parameters cho search
   */
  static validateSearchQuery(req, res, next) {
    const { query } = req.query;

    if (query && query.length > 100) {
      return res.status(400).json({
        message: 'Search query must be less than 100 characters'
      });
    }

    next();
  }

  /**
   * Validate MongoDB ObjectId
   */
  static validateObjectId(req, res, next) {
    const { id } = req.params;

    if (!objectIdRegex.test(id)) {
      return res.status(400).json({
        message: 'Invalid todo ID format',
        id
      });
    }

    next();
  }

  /**
   * Validate payload for reorder
   */
  static validateReorderPayload(req, res, next) {
    const { items } = req.body;
    const errors = [];

    if (!Array.isArray(items) || items.length === 0) {
      errors.push({
        field: "items",
        message: "Items must be a non-empty array",
      });
    } else {
      for (const item of items) {
        if (!item?.id || typeof item.id !== "string" || !objectIdRegex.test(item.id)) {
          errors.push({
            field: "items.id",
            message: "Each item must include a valid id",
          });
          break;
        }
        if (item.order !== undefined && !Number.isFinite(Number(item.order))) {
          errors.push({
            field: "items.order",
            message: "Each item order must be a number",
          });
          break;
        }
        if (item.status !== undefined && !STATUS_VALUES.has(item.status)) {
          errors.push({
            field: "items.status",
            message: "Status must be todo, in_progress, or done",
          });
          break;
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    next();
  }
}

export default TodoValidation;
