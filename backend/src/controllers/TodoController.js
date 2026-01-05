import TodoService from "../services/TodoService.js";
import BaseController from "./BaseController.js";

/**
 * TodoController - HTTP handlers for Todo resources
 */
class TodoController extends BaseController {
  // GET /api/todos - List todos with pagination and filters
  static getAllTodos = BaseController.asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      projectId,
      ownerId,
      status,
      important,
      completed,
      tags,
      sharedWith,
    } = req.query;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
      filter: {},
    };

    if (projectId) options.filter.projectId = projectId;
    if (ownerId) options.filter.ownerId = ownerId;
    if (status) options.filter.status = status;
    if (important !== undefined) {
      options.filter.important = important === "true";
    }
    if (completed !== undefined) {
      options.filter.completed = completed === "true";
    }
    if (tags) {
      options.filter.tags = { $in: tags.split(",") };
    }
    if (sharedWith) {
      options.filter.sharedWith = sharedWith;
    }

    const result = await TodoService.getTodos(options);
    res.json(result.todos);
  });

  // POST /api/todos - Create a new todo
  static createTodo = BaseController.asyncHandler(async (req, res) => {
    const todo = await TodoService.createTodo(req.body);
    res.status(201).json(todo);
  });

  // GET /api/todos/:id - Get todo by ID
  static getTodoById = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const todo = await TodoService.getTodoById(id);
    res.json(todo);
  });

  // PATCH /api/todos/:id - Update todo
  static updateTodo = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const todo = await TodoService.updateTodo(id, req.body);
    res.json(todo);
  });

  // DELETE /api/todos/:id - Delete todo
  static deleteTodo = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    await TodoService.deleteTodo(id);

    res.json({
      message: "Todo deleted successfully",
      id,
    });
  });

  // PATCH /api/todos/:id/toggle - Toggle completed status
  static toggleTodo = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const todo = await TodoService.toggleCompleted(id);
    res.json(todo);
  });

  // PATCH /api/todos/:id/important - Toggle important
  static toggleImportant = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const todo = await TodoService.toggleImportant(id);
    res.json(todo);
  });

  // GET /api/todos/search - Search todos
  static searchTodos = BaseController.asyncHandler(async (req, res) => {
    const query = req.query.query?.trim();

    if (!query) {
      return res.json([]);
    }

    const result = await TodoService.searchTodos(query);
    res.json(result.todos || []);
  });

  // GET /api/todos/filter - Filter todos
  static filterTodos = BaseController.asyncHandler(async (req, res) => {
    const { completed, important, status, tags, projectId, ownerId, sharedWith } =
      req.query;
    const filterOptions = {
      completed: completed !== undefined ? completed === "true" : undefined,
      important: important !== undefined ? important === "true" : undefined,
      status,
      tags: tags ? tags.split(",") : undefined,
      projectId,
      ownerId,
      sharedWith,
    };

    const result = await TodoService.filterTodos(filterOptions);
    res.json(result.todos);
  });

  // DELETE /api/todos/clear/completed - Delete all completed todos
  static clearCompletedTodos = BaseController.asyncHandler(async (req, res) => {
    const deletedCount = await TodoService.clearCompleted();
    res.json({
      message: `Deleted ${deletedCount} completed todos`,
      deletedCount,
    });
  });

  // GET /api/todos/due - Get upcoming todos
  static getDueTodos = BaseController.asyncHandler(async (req, res) => {
    const { before, after, days } = req.query;

    if (days) {
      const todos = await TodoService.getUpcomingTodos(parseInt(days));
      return res.json(todos);
    }

    const filterOptions = {
      deadline: {},
    };

    if (before) filterOptions.deadline.before = before;
    if (after) filterOptions.deadline.after = after;

    const result = await TodoService.filterTodos(filterOptions);
    res.json(result.todos);
  });

  // GET /api/todos/overdue - Get overdue todos
  static getOverdueTodos = BaseController.asyncHandler(async (req, res) => {
    const todos = await TodoService.getOverdueTodos();
    res.json(todos);
  });

  // GET /api/todos/stats - Todo stats
  static getTodoStats = BaseController.asyncHandler(async (req, res) => {
    const stats = await TodoService.getStats();
    res.json(stats);
  });

  // PATCH /api/todos/reorder - Reorder todos
  static reorderTodos = BaseController.asyncHandler(async (req, res) => {
    const { items } = req.body;
    const updated = await TodoService.reorderTodos(items);
    res.json(updated);
  });
}

export default TodoController;
