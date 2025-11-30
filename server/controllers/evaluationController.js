const Evaluation = require("../models/Evaluation")
const Submission = require("../models/Submission")

const evaluationController = {
  async getEvaluationBySubmission(req, res, next) {
    try {
      const { submissionId } = req.params

      const submission = await Submission.findById(submissionId)
      if (!submission) {
        return res.status(404).json({
          error: "SUBMISSION_NOT_FOUND",
          message: "Submission not found",
        })
      }

      const evaluation = await Evaluation.findBySubmissionId(submissionId)

      if (!evaluation) {
        return res.status(404).json({
          error: "EVALUATION_NOT_FOUND",
          message: "No evaluation found for this submission",
          submissionStatus: submission.status,
          hint:
            submission.status === "pending" || submission.status === "evaluating"
              ? "Evaluation is still in progress. Please check back in a few moments."
              : "Evaluation may have failed. Please contact support.",
        })
      }

      const evaluationWithScores = await Evaluation.getWithScores(evaluation.id)

      res.json({
        success: true,
        evaluation: evaluationWithScores,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateEvaluation(req, res, next) {
    try {
      const { id } = req.params
      const { overall_score, what_worked_well, opportunities_for_improvement, development_observations } = req.body
      const staffId = req.user.id

      const existing = await Evaluation.findById(id)
      if (!existing) {
        return res.status(404).json({
          error: "EVALUATION_NOT_FOUND",
          message: "Evaluation not found",
        })
      }

      const updated = await Evaluation.update(id, {
        overall_score,
        what_worked_well,
        opportunities_for_improvement,
        development_observations,
        evaluated_by_staff_id: staffId,
      })

      res.json({
        success: true,
        evaluation: updated,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = evaluationController
