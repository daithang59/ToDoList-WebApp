import Todo from "../models/Todo.js";

/**
 * TodoService - Xử lý business logic cho Todo
 */
class TodoService {
  /**
   * Lấy todos với các tùy chọn phân trang và sắp xếp
   */
  static async getTodos(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      filter = {}
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const todos = await Todo.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Todo.countDocuments(filter);

    return {
      todos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Tạo todo mới với validation
   */
  static async createTodo(todoData) {
    const { title, description, deadline, important, tags } = todoData;

    // Validation
    if (!title?.trim()) {
      throw new Error("Title is required");
    }

    // Xử lý deadline
    let processedDeadline = null;
    if (deadline) {
      processedDeadline = new Date(deadline);
      if (isNaN(processedDeadline.getTime())) {
        throw new Error("Invalid deadline format");
      }
    }

    // Xử lý tags
    const processedTags = Array.isArray(tags) 
      ? tags.filter(tag => tag?.trim()).map(tag => tag.trim())
      : [];

    const todo = await Todo.create({
      title: title.trim(),
      description: description?.trim() || "",
      deadline: processedDeadline,
      important: Boolean(important),
      tags: processedTags
    });

    return todo;
  }

  /**
   * Cập nhật todo với validation
   */
  static async updateTodo(id, updateData) {
    const todo = await Todo.findById(id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    // Validation cho title
    if (updateData.title !== undefined) {
      if (!updateData.title?.trim()) {
        throw new Error("Title cannot be empty");
      }
      updateData.title = updateData.title.trim();
    }

    // Xử lý deadline
    if (updateData.deadline !== undefined) {
      if (updateData.deadline) {
        const deadline = new Date(updateData.deadline);
        if (isNaN(deadline.getTime())) {
          throw new Error("Invalid deadline format");
        }
        updateData.deadline = deadline;
      } else {
        updateData.deadline = null;
      }
    }

    // Xử lý tags
    if (updateData.tags !== undefined) {
      updateData.tags = Array.isArray(updateData.tags)
        ? updateData.tags.filter(tag => tag?.trim()).map(tag => tag.trim())
        : [];
    }

    // Xử lý description
    if (updateData.description !== undefined) {
      updateData.description = updateData.description?.trim() || "";
    }

    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return updatedTodo;
  }

  /**
   * Lấy todo theo ID
   */
  static async getTodoById(id) {
    const todo = await Todo.findById(id);
    if (!todo) {
      throw new Error("Todo not found");
    }
    return todo;
  }

  /**
   * Xóa todo
   */
  static async deleteTodo(id) {
    const todo = await Todo.findByIdAndDelete(id);
    if (!todo) {
      throw new Error("Todo not found");
    }
    return todo;
  }

  /**
   * Toggle trạng thái của một field (completed, important, v.v.)
   */
  static async toggleField(id, fieldName) {
    const todo = await Todo.findById(id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    // Kiểm tra field có tồn tại trong schema không
    if (!(fieldName in todo.toObject())) {
      throw new Error(`Invalid field: ${fieldName}`);
    }

    todo[fieldName] = !todo[fieldName];
    await todo.save();
    return todo;
  }

  /**
   * Toggle trạng thái completed
   */
  static async toggleCompleted(id) {
    return this.toggleField(id, 'completed');
  }

  /**
   * Toggle trạng thái important
   */
  static async toggleImportant(id) {
    return this.toggleField(id, 'important');
  }

  /**
   * Tìm kiếm todos
   */
  static async searchTodos(query, options = {}) {
    if (!query?.trim()) {
      return [];
    }

    const searchRegex = new RegExp(query.trim(), "i");
    const filter = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    };

    return this.getTodos({ ...options, filter });
  }

  /**
   * Lọc todos theo nhiều tiêu chí
   */
  static async filterTodos(filterOptions, paginationOptions = {}) {
    const { completed, important, status, tags, deadline } = filterOptions;
    let filter = {};

    // Lọc theo trạng thái completed
    if (completed !== undefined) {
      filter.completed = completed;
    }

    // Lọc theo trạng thái important
    if (important !== undefined) {
      filter.important = important;
    }

    // Lọc theo status
    if (status) {
      switch (status) {
        case "active":
          filter.completed = false;
          break;
        case "completed":
          filter.completed = true;
          break;
        case "important":
          filter.important = true;
          break;
      }
    }

    // Lọc theo tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Lọc theo deadline
    if (deadline) {
      const { before, after } = deadline;
      filter.deadline = { $ne: null };

      if (before) {
        filter.deadline = { ...filter.deadline, $lte: new Date(before) };
      }
      if (after) {
        filter.deadline = { ...filter.deadline, $gte: new Date(after) };
      }
    }

    return this.getTodos({ ...paginationOptions, filter });
  }

  /**
   * Xóa tất cả todos đã hoàn thành
   */
  static async clearCompleted() {
    const result = await Todo.deleteMany({ completed: true });
    return result.deletedCount;
  }

  /**
   * Lấy thống kê todos
   */
  static async getStats() {
    const stats = await Todo.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$completed", 1, 0] } },
          important: { $sum: { $cond: ["$important", 1, 0] } },
          active: { $sum: { $cond: [{ $not: "$completed" }, 1, 0] } },
          withDeadline: { $sum: { $cond: [{ $ne: ["$deadline", null] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      important: 0,
      active: 0,
      withDeadline: 0
    };

    // Thêm tỷ lệ phần trăm
    result.completedPercentage = result.total > 0 
      ? Math.round((result.completed / result.total) * 100) 
      : 0;

    return result;
  }

  /**
   * Lấy todos sắp đến hạn
   */
  static async getUpcomingTodos(days = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);

    const todos = await Todo.find({
      deadline: {
        $gte: now,
        $lte: future
      },
      completed: false
    }).sort({ deadline: 1 });

    return todos;
  }

  /**
   * Lấy todos quá hạn
   */
  static async getOverdueTodos() {
    const now = new Date();

    const todos = await Todo.find({
      deadline: { $lt: now },
      completed: false
    }).sort({ deadline: 1 });

    return todos;
  }
}

export default TodoService;