import Todo from "../models/Todo.js";
import TodoService from "../services/TodoService.js";

/**
 * TodoController - Xử lý HTTP requests và responses cho Todo
 */
class TodoController {
  // GET /api/todos - Lấy tất cả todos với phân trang
  static async getAllTodos(req, res, next) {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50, // Tăng limit mặc định
        sortBy: sortBy || "createdAt",
        sortOrder: sortOrder || "desc"
      };

      const result = await TodoService.getTodos(options);
      
      // Trả về dạng array đơn giản để tương thích với frontend hiện tại
      res.json(result.todos);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/todos - Tạo todo mới
  static async createTodo(req, res, next) {
    try {
      const todo = await TodoService.createTodo(req.body);
      res.status(201).json(todo);
    } catch (error) {
      if (error.message.includes("required") || error.message.includes("Invalid")) {
        return res.status(400).json({ 
          message: error.message,
          field: error.message.includes("Title") ? "title" : "deadline"
        });
      }
      next(error);
    }
  }

  // GET /api/todos/:id - Lấy todo theo ID
  static async getTodoById(req, res, next) {
    try {
      const { id } = req.params;
      const todo = await Todo.findById(id);
      
      if (!todo) {
        return res.status(404).json({ 
          message: "Todo not found",
          id: id 
        });
      }
      
      res.json(todo);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/todos/:id - Cập nhật todo
  static async updateTodo(req, res, next) {
    try {
      const { id } = req.params;
      const todo = await TodoService.updateTodo(id, req.body);
      res.json(todo);
    } catch (error) {
      const { id } = req.params;
      
      if (error.message.includes("not found")) {
        return res.status(404).json({ 
          message: error.message,
          id: id 
        });
      }
      if (error.message.includes("required") || error.message.includes("Invalid") || error.message.includes("empty")) {
        return res.status(400).json({ 
          message: error.message,
          field: error.message.includes("Title") ? "title" : "deadline"
        });
      }
      next(error);
    }
  }

  // DELETE /api/todos/:id - Xóa todo
  static async deleteTodo(req, res, next) {
    try {
      const { id } = req.params;
      await TodoService.deleteTodo(id);
      
      res.json({ 
        message: "Todo deleted successfully",
        id: id 
      });
    } catch (error) {
      const { id } = req.params;
      
      if (error.message.includes("not found")) {
        return res.status(404).json({ 
          message: error.message,
          id: id 
        });
      }
      next(error);
    }
  }

  // PATCH /api/todos/:id/toggle - Toggle trạng thái completed
  static async toggleTodo(req, res, next) {
    try {
      const { id } = req.params;
      const todo = await TodoService.toggleCompleted(id);
      res.json(todo);
    } catch (error) {
      const { id } = req.params;
      
      if (error.message.includes("not found")) {
        return res.status(404).json({ 
          message: error.message,
          id: id 
        });
      }
      next(error);
    }
  }

  // PATCH /api/todos/:id/important - Toggle trạng thái important
  static async toggleImportant(req, res, next) {
    try {
      const { id } = req.params;
      const todo = await TodoService.toggleImportant(id);
      res.json(todo);
    } catch (error) {
      const { id } = req.params;
      
      if (error.message.includes("not found")) {
        return res.status(404).json({ 
          message: error.message,
          id: id 
        });
      }
      next(error);
    }
  }

  // GET /api/todos/search - Tìm kiếm todos
  static async searchTodos(req, res, next) {
    try {
      const query = req.query.query?.trim();
      
      if (!query) {
        return res.json([]);
      }
      
      const result = await TodoService.searchTodos(query);
      res.json(result.todos || []);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/todos/filter - Lọc todos theo trạng thái
  static async filterTodos(req, res, next) {
    try {
      const { completed, important, status, tags } = req.query;
      const filterOptions = {
        completed: completed !== undefined ? completed === "true" : undefined,
        important: important !== undefined ? important === "true" : undefined,
        status,
        tags: tags ? tags.split(",") : undefined
      };

      const result = await TodoService.filterTodos(filterOptions);
      res.json(result.todos);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/todos/clear/completed - Xóa tất cả todos đã hoàn thành
  static async clearCompletedTodos(req, res, next) {
    try {
      const deletedCount = await TodoService.clearCompleted();
      res.json({ 
        message: `Deleted ${deletedCount} completed todos`,
        deletedCount 
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/todos/due - Lấy todos sắp đến hạn
  static async getDueTodos(req, res, next) {
    try {
      const { before, after, days } = req.query;
      
      if (days) {
        const todos = await TodoService.getUpcomingTodos(parseInt(days));
        return res.json(todos);
      }

      const filterOptions = {
        deadline: {}
      };

      if (before) filterOptions.deadline.before = before;
      if (after) filterOptions.deadline.after = after;

      const result = await TodoService.filterTodos(filterOptions);
      res.json(result.todos);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/todos/overdue - Lấy todos quá hạn
  static async getOverdueTodos(req, res, next) {
    try {
      const todos = await TodoService.getOverdueTodos();
      res.json(todos);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/todos/stats - Thống kê todos
  static async getTodoStats(req, res, next) {
    try {
      const stats = await TodoService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export default TodoController;