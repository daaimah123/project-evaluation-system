const pool = require("../config/database")

class Project {
  static async findAll() {
    const result = await pool.query(
      `SELECT * FROM projects 
       WHERE is_active = true 
       ORDER BY project_number ASC`,
    )
    return result.rows
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id])
    return result.rows[0]
  }

  static async findByNumber(projectNumber) {
    const result = await pool.query("SELECT * FROM projects WHERE project_number = $1 AND is_active = true", [
      projectNumber,
    ])
    return result.rows[0]
  }

  static async create(projectData) {
    const { project_number, name, description, expected_timeline_days, tech_stack } = projectData

    const techStackJson = tech_stack && tech_stack.length > 0 ? JSON.stringify(tech_stack) : "[]"

    const result = await pool.query(
      `INSERT INTO projects 
       (project_number, name, description, expected_timeline_days, tech_stack)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING *`,
      [project_number, name, description, expected_timeline_days, techStackJson],
    )

    return result.rows[0]
  }

  static async update(id, projectData) {
    const { name, description, expected_timeline_days, tech_stack } = projectData

    const techStackJson = tech_stack && tech_stack.length > 0 ? JSON.stringify(tech_stack) : "[]"

    const result = await pool.query(
      `UPDATE projects 
       SET name = $1, 
           description = $2, 
           expected_timeline_days = $3, 
           tech_stack = $4::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, description, expected_timeline_days, techStackJson, id],
    )

    return result.rows[0]
  }

  static async delete(id) {
    // Soft delete - mark as inactive
    const result = await pool.query(
      `UPDATE projects 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id],
    )
    return result.rows[0]
  }

  static async getWithCriteria(projectId) {
    // Get project with all its criteria
    const project = await this.findById(projectId)
    if (!project) return null

    const criteriaResult = await pool.query(
      `SELECT * FROM project_criteria 
       WHERE project_id = $1 
       ORDER BY display_order ASC`,
      [projectId],
    )

    return {
      ...project,
      criteria: criteriaResult.rows,
    }
  }
}

module.exports = Project
