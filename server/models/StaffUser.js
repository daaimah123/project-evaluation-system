const pool = require("../config/database")
const bcrypt = require("bcrypt")

class StaffUser {
  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM staff_users WHERE email = $1", [email])
    return result.rows[0]
  }

  static async findById(id) {
    const result = await pool.query("SELECT id, email, full_name, role, created_at FROM staff_users WHERE id = $1", [
      id,
    ])
    return result.rows[0]
  }

  static async create({ email, password, full_name, role = "evaluator" }) {
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO staff_users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      [email, hashedPassword, full_name, role],
    )

    return result.rows[0]
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword)
  }

  static async updateLastLogin(id) {
    await pool.query("UPDATE staff_users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id])
  }
}

module.exports = StaffUser
