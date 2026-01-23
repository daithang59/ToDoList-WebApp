/**
 * Base Controller class providing common utilities for all controllers
 */
class BaseController {
  /**
   * Async handler wrapper to catch errors and pass to next()
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

export default BaseController;
