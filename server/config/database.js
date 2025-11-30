const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

async function testConnection() {
  try {
    const client = await pool.connect()
    await client.query("SELECT NOW()")
    client.release()
    console.log("✅Database connection successful")
    return true
  } catch (error) {
    console.error("❌Database connection failed:", error.message)
    throw error
  }
}

// Test connection
pool.on("connect", () => {
  console.log("Database client connected")
})

pool.on("error", (err) => {
  console.error("Unexpected database error:", err)
  process.exit(-1)
})

module.exports = pool
module.exports.testConnection = testConnection
