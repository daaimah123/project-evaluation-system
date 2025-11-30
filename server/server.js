const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const validateEnv = require("./utils/validateEnv")
validateEnv()

const { testConnection } = require("./config/database")
const evaluationWorker = require("./workers/evaluationWorker")
const errorHandler = require("./middleware/errorHandler")
const authRoutes = require("./routes/auth")
const projectRoutes = require("./routes/projects")
const submissionRoutes = require("./routes/submissions")
const participantRoutes = require("./routes/participants")

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
})
app.use("/api/", limiter)

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/submissions", submissionRoutes)
app.use("/api/participants", participantRoutes)

app.get("/api", (req, res) => {
  res.json({
    message: "Project Evaluation System API",
    version: "1.0.0",
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

async function startServer() {
  try {
    // Test database connection
    await testConnection()

    // Start evaluation worker
    evaluationWorker.start()

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`✅Server running on port ${PORT}`)
      console.log(`✅Environment: ${process.env.NODE_ENV || "development"}`)
      console.log(`✅Evaluation worker started\n`)
    })

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("\n⚡️Signal termination received, shutting down gracefully...")
      evaluationWorker.stop()
      process.exit(0)
    })

    process.on("SIGINT", () => {
      console.log("\n⚡️Signal interruption received, shutting down gracefully...")
      evaluationWorker.stop()
      process.exit(0)
    })
  } catch (error) {
    console.error("❌Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
