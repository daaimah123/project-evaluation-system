// Run this script to generate a proper bcrypt hash for the admin password
// Usage: node scripts/generate-password-hash.js

const bcrypt = require("bcrypt")

async function generateHash() {
  const password = "admin123"
  const saltRounds = 10

  try {
    const hash = await bcrypt.hash(password, saltRounds)
    console.log("\n=== Password Hash Generated ===")
    console.log(`Password: ${password}`)
    console.log(`Hash: ${hash}`)
    console.log("\nCopy this hash into your seed file or use the seed-staff-user.js script instead.")
  } catch (error) {
    console.error("❌Error generating hash:", error)
  }
}

generateHash()
