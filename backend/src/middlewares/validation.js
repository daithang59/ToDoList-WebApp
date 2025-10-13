/**
 * Validation middleware cho Todo routes
 */
class TodoValidation {
  /**
   * Validate dữ liệu khi tạo todo mới
   */
  static validateCreateTodo(req, res, next) {
    const { title, deadline, tags } = req.body;
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
    const { title, deadline, tags, description } = req.body;
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
    
    // Simple ObjectId validation (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!objectIdRegex.test(id)) {
      return res.status(400).json({
        message: 'Invalid todo ID format',
        id
      });
    }

    next();
  }
}

export default TodoValidation;