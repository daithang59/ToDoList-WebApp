/**
 * AppController - Xử lý các route chung của ứng dụng
 */
class AppController {
  // GET /api/health - Health check endpoint
  static async healthCheck(req, res, next) {
    try {
      const healthStatus = {
        status: "OK",
        message: "Todo API is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0"
      };

      res.json(healthStatus);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/info - API information
  static async getApiInfo(req, res, next) {
    try {
      const apiInfo = {
        name: "Todo List API",
        version: "1.0.0",
        description: "RESTful API for managing todos with full CRUD operations",
        author: "Huynh Le Dai Thang",
        endpoints: {
          todos: "/api/todos",
          health: "/api/health",
          docs: "/api-docs"
        },
        features: [
          "Create, read, update, delete todos",
          "Search and filter functionality", 
          "Mark todos as important",
          "Set deadlines for todos",
          "Add tags to todos",
          "Statistics and analytics"
        ]
      };

      res.json(apiInfo);
    } catch (error) {
      next(error);
    }
  }

  // 404 Handler - Route không tồn tại
  static notFound(req, res) {
    res.status(404).json({
      message: "Route not found",
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
}

export default AppController;