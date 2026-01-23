import { Router } from "express";
import TodoController from "../controllers/TodoController.js";
import TodoValidation from "../middlewares/validation.js";
import { validatePagination } from "../middlewares/pagination.js";

const router = Router();

// Collection routes
router.get("/", validatePagination, TodoController.getAllTodos);
router.post("/", TodoValidation.validateCreateTodo, TodoController.createTodo);

// Query routes
router.get(
  "/search",
  validatePagination,
  TodoValidation.validateSearchQuery,
  TodoController.searchTodos
);
router.get("/filter", validatePagination, TodoController.filterTodos);
router.get("/stats", TodoController.getTodoStats);

// Deadline routes
router.get("/due", validatePagination, TodoController.getDueTodos);
router.get("/overdue", validatePagination, TodoController.getOverdueTodos);

// Bulk operations
router.delete("/clear/completed", TodoController.clearCompletedTodos);
router.patch(
  "/reorder",
  TodoValidation.validateReorderPayload,
  TodoController.reorderTodos
);

// Single resource routes
router.get("/:id", TodoValidation.validateObjectId, TodoController.getTodoById);
router.patch(
  "/:id",
  TodoValidation.validateObjectId,
  TodoValidation.validateUpdateTodo,
  TodoController.updateTodo
);
router.delete(
  "/:id",
  TodoValidation.validateObjectId,
  TodoController.deleteTodo
);

// Toggle operations
router.patch(
  "/:id/toggle",
  TodoValidation.validateObjectId,
  TodoController.toggleTodo
);
router.patch(
  "/:id/important",
  TodoValidation.validateObjectId,
  TodoController.toggleImportant
);

export default router;
