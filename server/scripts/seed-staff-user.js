// Seed the database with a staff user that has a properly hashed password
// Usage: node scripts/seed-staff-user.js

require("dotenv").config()
const bcrypt = require("bcrypt")
const { Pool } = require("pg")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function seedStaffUser() {
  try {
    // Generate proper hash for 'admin123'
    const password = "admin123"
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)

    console.log("Inserting staff user with properly hashed password...")

    // Insert staff user
    const result = await pool.query(
      `INSERT INTO staff_users (email, full_name, password_hash, role) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) 
       DO UPDATE SET password_hash = $3
       RETURNING id, email, full_name, role`,
      ["admin@techtonica.org", "Admin User", hash, "admin"],
    )

    console.log("\nStaff user created/updated successfully:")
    console.log(result.rows[0])
    console.log("\nYou can now login with:")
    console.log("Email: admin@techtonica.org")
    console.log("Password: admin123")

    await pool.end()
  } catch (error) {
    console.error("Error seeding staff user:", error)
    process.exit(1)
  }
}

seedStaffUser()
