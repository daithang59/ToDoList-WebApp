import { Router } from "express";
import TodoController from "../controllers/TodoController.js";
import TodoValidation from "../middlewares/validation.js";

const router = Router();

// =================== COLLECTION ROUTES (không cần ID) ===================

// GET /api/todos - Lấy tất cả todos với phân trang
router.get("/", TodoController.getAllTodos);

// POST /api/todos - Tạo todo mới
router.post("/", TodoValidation.validateCreateTodo, TodoController.createTodo);

// =================== QUERY ROUTES (các route đặc biệt) ===================

// GET /api/todos/search - Tìm kiếm todos (phải đặt trước /:id)
router.get("/search", TodoValidation.validateSearchQuery, TodoController.searchTodos);

// GET /api/todos/filter - Lọc todos theo trạng thái
router.get("/filter", TodoController.filterTodos);

// GET /api/todos/stats - Thống kê todos
router.get("/stats", TodoController.getTodoStats);

// =================== DEADLINE RELATED ROUTES ===================

// GET /api/todos/due - Lấy todos sắp đến hạn
router.get("/due", TodoController.getDueTodos);

// GET /api/todos/overdue - Lấy todos quá hạn
router.get("/overdue", TodoController.getOverdueTodos);

// =================== BULK OPERATIONS ===================

// DELETE /api/todos/clear/completed - Xóa tất cả todos đã hoàn thành
router.delete("/clear/completed", TodoController.clearCompletedTodos);

// =================== SINGLE RESOURCE ROUTES (cần ID) ===================

// GET /api/todos/:id - Lấy todo theo ID
router.get("/:id", TodoValidation.validateObjectId, TodoController.getTodoById);

// PATCH /api/todos/:id - Cập nhật todo
router.patch("/:id", 
  TodoValidation.validateObjectId, 
  TodoValidation.validateUpdateTodo, 
  TodoController.updateTodo
);

// DELETE /api/todos/:id - Xóa todo
router.delete("/:id", TodoValidation.validateObjectId, TodoController.deleteTodo);

// =================== TOGGLE OPERATIONS ===================

// PATCH /api/todos/:id/toggle - Toggle trạng thái completed
router.patch("/:id/toggle", TodoValidation.validateObjectId, TodoController.toggleTodo);

// PATCH /api/todos/:id/important - Toggle trạng thái important
router.patch("/:id/important", TodoValidation.validateObjectId, TodoController.toggleImportant);

export default router;


