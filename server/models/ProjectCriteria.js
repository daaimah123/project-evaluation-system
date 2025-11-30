const pool = require("../config/database")

class ProjectCriteria {
  static async findByProjectId(projectId) {
    const result = await pool.query(
      `SELECT * FROM project_criteria 
       WHERE project_id = $1 
       ORDER BY display_order ASC`,
      [projectId],
    )
    return result.rows
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM project_criteria WHERE id = $1", [id])
    return result.rows[0]
  }

  static async create(criteriaData) {
    const {
      project_id,
      criterion_name,
      category,
      display_order,
      what_to_check,
      files_to_examine,
      rubric_4,
      rubric_3,
      rubric_2,
      rubric_1,
      weight,
    } = criteriaData

    const result = await pool.query(
      `INSERT INTO project_criteria 
       (project_id, criterion_name, category, display_order, what_to_check, 
        files_to_examine, rubric_4, rubric_3, rubric_2, rubric_1, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        project_id,
        criterion_name,
        category || "code_quality",
        display_order || 0,
        what_to_check || "",
        files_to_examine ? JSON.stringify(files_to_examine) : "[]",
        rubric_4,
        rubric_3,
        rubric_2,
        rubric_1,
        weight || "important",
      ],
    )

    return result.rows[0]
  }

  static async update(id, criteriaData) {
    const {
      criterion_name,
      category,
      display_order,
      what_to_check,
      files_to_examine,
      rubric_4,
      rubric_3,
      rubric_2,
      rubric_1,
      weight,
    } = criteriaData

    const result = await pool.query(
      `UPDATE project_criteria 
       SET criterion_name = $1,
           category = $2,
           display_order = $3,
           what_to_check = $4,
           files_to_examine = $5,
           rubric_4 = $6,
           rubric_3 = $7,
           rubric_2 = $8,
           rubric_1 = $9,
           weight = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        criterion_name,
        category,
        display_order,
        what_to_check,
        files_to_examine ? JSON.stringify(files_to_examine) : "[]",
        rubric_4,
        rubric_3,
        rubric_2,
        rubric_1,
        weight,
        id,
      ],
    )

    return result.rows[0]
  }

  static async delete(id) {
    const result = await pool.query("DELETE FROM project_criteria WHERE id = $1 RETURNING *", [id])
    return result.rows[0]
  }

  static async bulkCreate(projectId, criteriaArray) {
    const created = []

    for (const criteria of criteriaArray) {
      const result = await this.create({
        project_id: projectId,
        ...criteria,
      })
      created.push(result)
    }

    return created
  }
}

module.exports = ProjectCriteria
