const pool = require("../config/database")

class Evaluation {
  static async findBySubmissionId(submissionId) {
    const result = await pool.query(
      `SELECT * FROM evaluations 
       WHERE submission_id = $1 AND is_current = true
       ORDER BY created_at DESC
       LIMIT 1`,
      [submissionId],
    )
    return result.rows[0]
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM evaluations WHERE id = $1", [id])
    return result.rows[0]
  }

  static async create(evaluationData) {
    const {
      submission_id,
      evaluation_type,
      overall_score,
      what_worked_well,
      opportunities_for_improvement,
      development_observations,
      ai_model_used,
      evaluated_by_staff_id,
    } = evaluationData

    const result = await pool.query(
      `INSERT INTO evaluations 
       (submission_id, evaluation_type, overall_score, what_worked_well,
        opportunities_for_improvement, development_observations, 
        ai_model_used, evaluated_by_staff_id, is_current)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING *`,
      [
        submission_id,
        evaluation_type,
        overall_score,
        Array.isArray(what_worked_well) ? JSON.stringify(what_worked_well) : what_worked_well,
        Array.isArray(opportunities_for_improvement)
          ? JSON.stringify(opportunities_for_improvement)
          : opportunities_for_improvement,
        Array.isArray(development_observations) ? JSON.stringify(development_observations) : development_observations,
        ai_model_used,
        evaluated_by_staff_id,
      ],
    )

    return result.rows[0]
  }

  static async update(id, evaluationData) {
    const {
      overall_score,
      what_worked_well,
      opportunities_for_improvement,
      development_observations,
      evaluated_by_staff_id,
    } = evaluationData

    const result = await pool.query(
      `UPDATE evaluations 
       SET evaluation_type = 'staff_modified',
           overall_score = $1,
           what_worked_well = $2,
           opportunities_for_improvement = $3,
           development_observations = $4,
           evaluated_by_staff_id = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        overall_score,
        Array.isArray(what_worked_well) ? JSON.stringify(what_worked_well) : what_worked_well,
        Array.isArray(opportunities_for_improvement)
          ? JSON.stringify(opportunities_for_improvement)
          : opportunities_for_improvement,
        Array.isArray(development_observations) ? JSON.stringify(development_observations) : development_observations,
        evaluated_by_staff_id,
        id,
      ],
    )

    return result.rows[0]
  }

  static async getWithScores(evaluationId) {
    const evaluation = await this.findById(evaluationId)
    if (!evaluation) return null

    const scoresResult = await pool.query(
      `SELECT cs.*, pc.criterion_name, pc.category, pc.weight
       FROM criterion_scores cs
       JOIN project_criteria pc ON cs.criterion_id = pc.id
       WHERE cs.evaluation_id = $1
       ORDER BY pc.display_order ASC`,
      [evaluationId],
    )

    return {
      ...evaluation,
      criterion_scores: scoresResult.rows,
    }
  }
}

module.exports = Evaluation
