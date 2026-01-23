export function notFound(req, res) {
  res.status(404).json({
    message: "Route not found",
  });
}

export function errorHandler(err, req, res) {
  console.error("ERR:", err);
  const status = err.status || 500;
  const payload = {
    message: err.message || "Internal Server Error",
  };
  if (err.code) {
    payload.code = err.code;
  }
  if (err.details) {
    payload.details = err.details;
  }
  res.status(status).json(payload);
}
