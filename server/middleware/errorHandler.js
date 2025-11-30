const errorHandler = (err, req, res, next) => {
  console.error("❌Error:", err)

  // Default error
  let status = err.status || 500
  let message = err.message || "Internal server error"
  let error = err.error || "SERVER_ERROR"

  // Specific error types
  if (err.name === "ValidationError") {
    status = 400
    error = "VALIDATION_ERROR"
  }

  if (err.name === "JsonWebTokenError") {
    status = 401
    error = "INVALID_TOKEN"
    message = "Invalid authentication token"
  }

  res.status(status).json({
    error,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = errorHandler
