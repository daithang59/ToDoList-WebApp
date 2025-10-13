/**
 * BaseController - Base class chứa các method chung cho tất cả controllers
 */
class BaseController {
  /**
   * Xử lý error response thống nhất
   */
  static handleError(error, req, res, next) {
    const { id } = req.params || {};
    
    // Not Found errors
    if (error.message.includes("not found")) {
      return res.status(404).json({ 
        message: error.message,
        ...(id && { id })
      });
    }
    
    // Validation errors
    if (error.message.includes("required") || 
        error.message.includes("Invalid") || 
        error.message.includes("empty")) {
      return res.status(400).json({ 
        message: error.message,
        field: this.getFieldFromError(error.message)
      });
    }
    
    // Pass to global error handler
    next(error);
  }
  
  /**
   * Xác định field gây lỗi từ error message
   */
  static getFieldFromError(message) {
    if (message.includes("Title")) return "title";
    if (message.includes("deadline")) return "deadline";
    if (message.includes("description")) return "description";
    if (message.includes("tags")) return "tags";
    return null;
  }
  
  /**
   * Wrapper để xử lý async errors tự động
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(error => {
        this.handleError(error, req, res, next);
      });
    };
  }
  
  /**
   * Success response helper
   */
  static sendSuccess(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Created response helper
   */
  static sendCreated(res, data, message = "Created successfully") {
    return this.sendSuccess(res, data, message, 201);
  }
}

export default BaseController;