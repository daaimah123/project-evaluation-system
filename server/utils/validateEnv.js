/**
 * Validate that all required environment variables are set
 */
function validateEnv() {
  const required = {
    DATABASE_URL: "PostgreSQL database connection string",
    JWT_SECRET: "Secret key for JWT token signing",
    GITHUB_TOKEN: "GitHub personal access token for repository access",
    GEMINI_API_KEY: "Google Gemini API key for AI evaluation",
  }

  const optional = {
    CLIENT_URL: "Frontend URL for CORS (defaults to http://localhost:3000)",
    NODE_ENV: "Environment (development/production)",
    PORT: "Server port (defaults to 5000)",
  }

  const missing = []
  const warnings = []

  // Check required variables
  for (const [key, description] of Object.entries(required)) {
    if (!process.env[key]) {
      missing.push(`${key}: ${description}`)
    }
  }

  // Check optional variables
  for (const [key, description] of Object.entries(optional)) {
    if (!process.env[key]) {
      warnings.push(`${key}: ${description}`)
    }
  }

  // Report results
  if (missing.length > 0) {
    console.error("\n⚠️MISSING REQUIRED ENVIRONMENT VARIABLES:\n")
    missing.forEach((msg) => console.error(`  - ${msg}`))
    console.error("\n⚠️Please set these in your .env file\n")
    process.exit(1)
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️Optional environment variables not set (using defaults):\n")
    warnings.forEach((msg) => console.warn(`  - ${msg}`))
    console.warn("")
  }

  console.log("✅Environment variables validated\n")
}

module.exports = validateEnv
