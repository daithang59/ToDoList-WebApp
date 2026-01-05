import { Router } from "express";
import TodoController from "../controllers/TodoController.js";
import TodoValidation from "../middlewares/validation.js";

const router = Router();

// Collection routes
router.get("/", TodoController.getAllTodos);
router.post("/", TodoValidation.validateCreateTodo, TodoController.createTodo);

// Query routes
router.get(
  "/search",
  TodoValidation.validateSearchQuery,
  TodoController.searchTodos
);
router.get("/filter", TodoController.filterTodos);
router.get("/stats", TodoController.getTodoStats);

// Deadline routes
router.get("/due", TodoController.getDueTodos);
router.get("/overdue", TodoController.getOverdueTodos);

// Bulk operations
router.delete("/clear/completed", TodoController.clearCompletedTodos);
router.patch("/reorder", TodoController.reorderTodos);

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
