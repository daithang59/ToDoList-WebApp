class NotificationValidation {
  static validateSubscribe(req, res, next) {
    const { subscription } = req.body;
    const errors = [];

    if (!subscription || typeof subscription !== "object") {
      errors.push({
        field: "subscription",
        message: "Subscription is required",
      });
    } else if (!subscription.endpoint || typeof subscription.endpoint !== "string") {
      errors.push({
        field: "subscription.endpoint",
        message: "Subscription endpoint is required",
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    return next();
  }

  static validateUnsubscribe(req, res, next) {
    const endpoint = req.body?.endpoint || req.query?.endpoint;
    if (!endpoint || typeof endpoint !== "string") {
      return res.status(400).json({
        message: "Validation failed",
        errors: [{ field: "endpoint", message: "Endpoint is required" }],
      });
    }
    return next();
  }
}

export default NotificationValidation;
