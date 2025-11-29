const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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

// Start server
app.listen(PORT, () => {
  console.log(`[v0] Server running on port ${PORT}`)
  console.log(`[v0] Environment: ${process.env.NODE_ENV || "development"}`)
})
