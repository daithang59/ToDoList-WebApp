import TodoService from "../services/TodoService.js";
import BaseController from "./BaseController.js";

/**
 * TodoController - Xử lý HTTP requests và responses cho Todo
 */
class TodoController extends BaseController {
  // GET /api/todos - Lấy tất cả todos với phân trang
  static getAllTodos = BaseController.asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder } = req.query;
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc"
    };

    const result = await TodoService.getTodos(options);
    
    // Trả về dạng array đơn giản để tương thích với frontend hiện tại
    res.json(result.todos);
  });

  // POST /api/todos - Tạo todo mới
  static createTodo = BaseController.asyncHandler(async (req, res) => {
    const todo = await TodoService.createTodo(req.body);
    res.status(201).json(todo);
  });

  // GET /api/todos/:id - Lấy todo theo ID
  static getTodoById = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const todo = await TodoService.getTodoById(id);
    res.json(todo);
  });

  // PATCH /api/todos/:id - Cập nhật todo
  static updateTodo = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const todo = await TodoService.updateTodo(id, req.body);
    res.json(todo);
  });

  // DELETE /api/todos/:id - Xóa todo
  static deleteTodo = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    await TodoService.deleteTodo(id);
    
    res.json({ 
      message: "Todo deleted successfully",
      id: id 
    });
  });

  // PATCH /api/todos/:id/toggle - Toggle trạng thái completed
  static toggleTodo = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const todo = await TodoService.toggleCompleted(id);
    res.json(todo);
  });

  // PATCH /api/todos/:id/important - Toggle trạng thái important
  static toggleImportant = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const todo = await TodoService.toggleImportant(id);
    res.json(todo);
  });

  // GET /api/todos/search - Tìm kiếm todos
  static searchTodos = BaseController.asyncHandler(async (req, res) => {
    const query = req.query.query?.trim();
    
    if (!query) {
      return res.json([]);
    }
    
    const result = await TodoService.searchTodos(query);
    res.json(result.todos || []);
  });

  // GET /api/todos/filter - Lọc todos theo trạng thái
  static filterTodos = BaseController.asyncHandler(async (req, res) => {
    const { completed, important, status, tags } = req.query;
    const filterOptions = {
      completed: completed !== undefined ? completed === "true" : undefined,
      important: important !== undefined ? important === "true" : undefined,
      status,
      tags: tags ? tags.split(",") : undefined
    };

    const result = await TodoService.filterTodos(filterOptions);
    res.json(result.todos);
  });

  // DELETE /api/todos/clear/completed - Xóa tất cả todos đã hoàn thành
  static clearCompletedTodos = BaseController.asyncHandler(async (req, res) => {
    const deletedCount = await TodoService.clearCompleted();
    res.json({ 
      message: `Deleted ${deletedCount} completed todos`,
      deletedCount 
    });
  });

  // GET /api/todos/due - Lấy todos sắp đến hạn
  static getDueTodos = BaseController.asyncHandler(async (req, res) => {
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
  });

  // GET /api/todos/overdue - Lấy todos quá hạn
  static getOverdueTodos = BaseController.asyncHandler(async (req, res) => {
    const todos = await TodoService.getOverdueTodos();
    res.json(todos);
  });

  // GET /api/todos/stats - Thống kê todos
  static getTodoStats = BaseController.asyncHandler(async (req, res) => {
    const stats = await TodoService.getStats();
    res.json(stats);
  });
}

export default TodoController;