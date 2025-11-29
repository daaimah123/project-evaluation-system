const pool = require("../config/database")

class Participant {
  static async findAll(filters = {}) {
    let query = "SELECT * FROM participants WHERE 1=1"
    const params = []
    let paramIndex = 1

    if (filters.cohortYear) {
      query += ` AND cohort_year = $${paramIndex}`
      params.push(filters.cohortYear)
      paramIndex++
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`
      params.push(filters.status)
      paramIndex++
    }

    query += " ORDER BY first_name, last_name"

    const result = await pool.query(query, params)
    return result.rows
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM participants WHERE id = $1", [id])
    return result.rows[0]
  }

  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM participants WHERE email = $1", [email])
    return result.rows[0]
  }

  static async create(participantData) {
    const { email, first_name, last_name, cohort_year, status = "active" } = participantData

    const result = await pool.query(
      `INSERT INTO participants 
       (email, first_name, last_name, cohort_year, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, first_name, last_name, cohort_year, status],
    )

    return result.rows[0]
  }

  static async update(id, participantData) {
    const { email, first_name, last_name, cohort_year, status } = participantData

    const result = await pool.query(
      `UPDATE participants 
       SET email = $1,
           first_name = $2,
           last_name = $3,
           cohort_year = $4,
           status = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [email, first_name, last_name, cohort_year, status, id],
    )

    return result.rows[0]
  }

  static async delete(id) {
    const result = await pool.query("DELETE FROM participants WHERE id = $1 RETURNING *", [id])
    return result.rows[0]
  }
}

module.exports = Participant
