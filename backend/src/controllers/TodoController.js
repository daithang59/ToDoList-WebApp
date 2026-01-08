import TodoService from "../services/TodoService.js";
import BaseController from "./BaseController.js";

const STATUS_VALUES = new Set(["todo", "in_progress", "done"]);
const SORT_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "deadline",
  "title",
  "order",
  "status",
]);

const normalizeList = (value) =>
  typeof value === "string"
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const mergeFilters = (base, extra) => {
  if (!extra || Object.keys(extra).length === 0) return base;
  if (!base || Object.keys(base).length === 0) return extra;
  return { $and: [base, extra] };
};

const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

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
      status,
      important,
      completed,
      tags,
      sharedWith,
      query,
      filter: filterKey,
      deadlineBefore,
      deadlineAfter,
    } = req.query;

    const memberId = req.user?.id;
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      sortBy: SORT_FIELDS.has(sortBy) ? sortBy : "createdAt",
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
      filter: {},
      memberId,
    };

    if (projectId) options.filter.projectId = projectId;
    if (status && STATUS_VALUES.has(status)) {
      options.filter.status = status;
    }
    if (important !== undefined) {
      options.filter.important = important === "true";
    }
    if (completed !== undefined) {
      options.filter.completed = completed === "true";
    }
    const tagList = normalizeList(tags);
    if (tagList.length > 0) {
      options.filter.tags = { $in: tagList };
    }
    if (sharedWith) {
      options.filter.sharedWith = sharedWith;
    }

    if (filterKey === "active") {
      options.filter.completed = false;
    } else if (filterKey === "completed") {
      options.filter.completed = true;
    } else if (filterKey === "important") {
      options.filter.important = true;
    } else if (filterKey === "today") {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      options.filter.deadline = {
        ...(options.filter.deadline || {}),
        $gte: startOfDay,
        $lte: endOfDay,
      };
    } else if (filterKey === "overdue") {
      options.filter.completed = false;
      options.filter.deadline = {
        ...(options.filter.deadline || {}),
        $lt: new Date(),
      };
    }

    const beforeDate = parseDateValue(deadlineBefore);
    const afterDate = parseDateValue(deadlineAfter);
    if (beforeDate || afterDate) {
      options.filter.deadline = {
        ...(options.filter.deadline || {}),
        ...(beforeDate ? { $lte: beforeDate } : {}),
        ...(afterDate ? { $gte: afterDate } : {}),
      };
    }

    if (query?.trim()) {
      const searchRegex = new RegExp(query.trim(), "i");
      const searchFilter = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
        ],
      };
      options.filter = mergeFilters(options.filter, searchFilter);
    }

    const result = await TodoService.getTodos(options);
    res.json(result);
  });

  // POST /api/todos - Create a new todo
  static createTodo = BaseController.asyncHandler(async (req, res) => {
    const memberId = req.user?.id;
    const todo = await TodoService.createTodo(req.body, memberId);
    res.status(201).json(todo);
  });

  // GET /api/todos/:id - Get todo by ID
  static getTodoById = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const memberId = req.user?.id;
    const todo = await TodoService.getTodoById(id, memberId);
    res.json(todo);
  });

  // PATCH /api/todos/:id - Update todo
  static updateTodo = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const memberId = req.user?.id;
    const todo = await TodoService.updateTodo(id, req.body, memberId);
    res.json(todo);
  });

  // DELETE /api/todos/:id - Delete todo
  static deleteTodo = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const memberId = req.user?.id;
    await TodoService.deleteTodo(id, memberId);

    res.json({
      message: "Todo deleted successfully",
      id,
    });
  });

  // PATCH /api/todos/:id/toggle - Toggle completed status
  static toggleTodo = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const memberId = req.user?.id;
    const todo = await TodoService.toggleCompleted(id, memberId);
    res.json(todo);
  });

  // PATCH /api/todos/:id/important - Toggle important
  static toggleImportant = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const memberId = req.user?.id;
    const todo = await TodoService.toggleImportant(id, memberId);
    res.json(todo);
  });

  // GET /api/todos/search - Search todos
  static searchTodos = BaseController.asyncHandler(async (req, res) => {
    const query = req.query.query?.trim();
    const memberId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const sortBy = SORT_FIELDS.has(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

    if (!query) {
      return res.json({
        todos: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    const result = await TodoService.searchTodos(query, {
      page,
      limit,
      sortBy,
      sortOrder,
      memberId,
    });
    res.json(result);
  });

  // GET /api/todos/filter - Filter todos
  static filterTodos = BaseController.asyncHandler(async (req, res) => {
    const {
      completed,
      important,
      status,
      tags,
      projectId,
      sharedWith,
    } = req.query;
    const memberId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const sortBy = SORT_FIELDS.has(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
    const filterOptions = {
      completed: completed !== undefined ? completed === "true" : undefined,
      important: important !== undefined ? important === "true" : undefined,
      status,
      tags: tags ? normalizeList(tags) : undefined,
      projectId,
      sharedWith,
      memberId,
    };

    const result = await TodoService.filterTodos(filterOptions, {
      page,
      limit,
      sortBy,
      sortOrder,
      memberId,
    });
    res.json(result);
  });

  // DELETE /api/todos/clear/completed - Delete all completed todos
  static clearCompletedTodos = BaseController.asyncHandler(async (req, res) => {
    const memberId = req.user?.id;
    const deletedCount = await TodoService.clearCompleted(memberId);
    res.json({
      message: `Deleted ${deletedCount} completed todos`,
      deletedCount,
    });
  });

  // GET /api/todos/due - Get upcoming todos
  static getDueTodos = BaseController.asyncHandler(async (req, res) => {
    const { before, after, days } = req.query;
    const memberId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const sortBy = SORT_FIELDS.has(req.query.sortBy)
      ? req.query.sortBy
      : "deadline";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

    if (days) {
      const todos = await TodoService.getUpcomingTodos(
        parseInt(days, 10),
        memberId
      );
      return res.json({
        todos,
        pagination: {
          page: 1,
          limit: todos.length,
          total: todos.length,
          pages: todos.length > 0 ? 1 : 0,
        },
      });
    }

    const filterOptions = {
      deadline: {},
      memberId,
    };

    if (before) filterOptions.deadline.before = before;
    if (after) filterOptions.deadline.after = after;

    const result = await TodoService.filterTodos(filterOptions, {
      page,
      limit,
      sortBy,
      sortOrder,
      memberId,
    });
    res.json(result);
  });

  // GET /api/todos/overdue - Get overdue todos
  static getOverdueTodos = BaseController.asyncHandler(async (req, res) => {
    const memberId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const sortBy = SORT_FIELDS.has(req.query.sortBy)
      ? req.query.sortBy
      : "deadline";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
    const result = await TodoService.getTodos({
      page,
      limit,
      sortBy,
      sortOrder,
      memberId,
      filter: {
        deadline: { $lt: new Date() },
        completed: false,
      },
    });
    res.json(result);
  });

  // GET /api/todos/stats - Todo stats
  static getTodoStats = BaseController.asyncHandler(async (req, res) => {
    const memberId = req.user?.id;
    const stats = await TodoService.getStats(memberId);
    res.json(stats);
  });

  // PATCH /api/todos/reorder - Reorder todos
  static reorderTodos = BaseController.asyncHandler(async (req, res) => {
    const { items } = req.body;
    const memberId = req.user?.id;
    const updated = await TodoService.reorderTodos(items, memberId);
    res.json(updated);
  });
}

export default TodoController;
