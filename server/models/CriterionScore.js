const pool = require("../config/database")

class CriterionScore {
  static async create(scoreData) {
    const { evaluation_id, criterion_id, score, reasoning, code_references, modified_by_staff } = scoreData

    const result = await pool.query(
      `INSERT INTO criterion_scores 
       (evaluation_id, criterion_id, score, reasoning, code_references, modified_by_staff)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        evaluation_id,
        criterion_id,
        score,
        reasoning,
        JSON.stringify(code_references || []),
        modified_by_staff || false,
      ],
    )

    return result.rows[0]
  }

  static async bulkCreate(evaluationId, scores) {
    const created = []

    for (const scoreData of scores) {
      const result = await this.create({
        evaluation_id: evaluationId,
        ...scoreData,
      })
      created.push(result)
    }

    return created
  }

  static async update(id, scoreData) {
    const { score, reasoning, code_references } = scoreData

    const result = await pool.query(
      `UPDATE criterion_scores 
       SET score = $1,
           reasoning = $2,
           code_references = $3,
           modified_by_staff = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [score, reasoning, JSON.stringify(code_references || []), id],
    )

    return result.rows[0]
  }

  static async findByEvaluationId(evaluationId) {
    const result = await pool.query("SELECT * FROM criterion_scores WHERE evaluation_id = $1", [evaluationId])
    return result.rows
  }
}

module.exports = CriterionScore
