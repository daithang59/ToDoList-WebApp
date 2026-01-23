const MAX_PAGE_SIZE = 200;

export function validatePagination(req, res, next) {
  const { page, limit } = req.query;
  const errors = [];

  if (page !== undefined) {
    const parsed = Number.parseInt(page, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      errors.push({ field: "page", message: "Page must be a positive integer" });
    }
  }

  if (limit !== undefined) {
    const parsed = Number.parseInt(limit, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > MAX_PAGE_SIZE) {
      errors.push({
        field: "limit",
        message: `Limit must be between 1 and ${MAX_PAGE_SIZE}`,
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  return next();
}
