const pool = require("../config/database")

class Submission {
  static async findAll(filters = {}) {
    let query = `
      SELECT s.*, 
             p.name as participant_name, 
             p.email as participant_email,
             pr.name as project_name,
             pr.project_number
      FROM submissions s
      JOIN participants p ON s.participant_id = p.id
      JOIN projects pr ON s.project_id = pr.id
      WHERE 1=1
    `
    const params = []
    let paramIndex = 1

    if (filters.status) {
      query += ` AND s.status = $${paramIndex}`
      params.push(filters.status)
      paramIndex++
    }

    if (filters.participantId) {
      query += ` AND s.participant_id = $${paramIndex}`
      params.push(filters.participantId)
      paramIndex++
    }

    if (filters.projectId) {
      query += ` AND s.project_id = $${paramIndex}`
      params.push(filters.projectId)
      paramIndex++
    }

    query += " ORDER BY s.created_at DESC"

    const result = await pool.query(query, params)
    return result.rows
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT s.*, 
              p.name as participant_name, 
              p.email as participant_email,
              pr.name as project_name,
              pr.project_number
       FROM submissions s
       JOIN participants p ON s.participant_id = p.id
       JOIN projects pr ON s.project_id = pr.id
       WHERE s.id = $1`,
      [id],
    )
    return result.rows[0]
  }

  static async create(submissionData) {
    const { participant_id, project_id, github_repo_url, repo_visibility, notes_from_participant } = submissionData

    const result = await pool.query(
      `INSERT INTO submissions 
       (participant_id, project_id, github_repo_url, repo_visibility, 
        notes_from_participant, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [participant_id, project_id, github_repo_url, repo_visibility, notes_from_participant],
    )

    return result.rows[0]
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE submissions 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id],
    )
    return result.rows[0]
  }

  static async delete(id) {
    const result = await pool.query("DELETE FROM submissions WHERE id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async getByParticipantAndProject(participantId, projectId) {
    const result = await pool.query(
      `SELECT * FROM submissions 
       WHERE participant_id = $1 AND project_id = $2`,
      [participantId, projectId],
    )
    return result.rows[0]
  }
}

module.exports = Submission
