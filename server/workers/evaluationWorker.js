const Submission = require("../models/Submission")
const Evaluation = require("../models/Evaluation")
const CriterionScore = require("../models/CriterionScore")
const Project = require("../models/Project")
const queueService = require("../services/queueService")
const githubService = require("../services/githubService")
const sanitizationService = require("../services/sanitizationService")
const evaluationService = require("../services/evaluationService")

/**
 * Evaluation Worker - Processes queued submissions
 * Runs continuously in background checking for pending evaluations
 */
class EvaluationWorker {
  constructor() {
    this.isRunning = false
    this.interval = null
  }

  /**
   * Start the worker
   */
  start() {
    if (this.isRunning) {
      console.log("🏃🏽‍♀️Evaluation worker already running")
      return
    }

    this.isRunning = true
    console.log("🚀Starting evaluation worker...")

    // Process queue every 30 seconds
    this.interval = setInterval(() => {
      this.processQueue()
    }, 30000)

    // Process immediately on start
    this.processQueue()
  }

  /**
   * Stop the worker
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.isRunning = false
    console.log("🛑Evaluation worker stopped")
  }

  /**
   * Process next job in queue
   */
  async processQueue() {
    const job = queueService.getNextJob()

    if (!job) {
      return
    }

    console.log(`Processing evaluation for submission: ${job.submissionId}`)

    try {
      await this.evaluateSubmission(job.submissionId)
      queueService.completeJob(job.submissionId, true)
    } catch (error) {
      console.error(`Evaluation failed for submission ${job.submissionId}:`, error)
      queueService.failJob(job.submissionId, error)

      // Update submission status to error
      await Submission.updateStatus(job.submissionId, "evaluation_failed")
    }
  }

  /**
   * Complete evaluation pipeline for a submission
   */
  async evaluateSubmission(submissionId) {
    // Update status to evaluating
    await Submission.updateStatus(submissionId, "evaluating")

    // Get submission details
    const submission = await Submission.findById(submissionId)
    if (!submission) {
      throw new Error("Submission not found")
    }

    // Get project with criteria
    const project = await Project.getWithCriteria(submission.project_id)
    if (!project) {
      throw new Error("Project not found")
    }

    console.log(`Analyzing repository: ${submission.github_repo_url}`)

    // Step 1: Clone and analyze repository
    const repoAnalysis = await githubService.analyzeRepository(submission.github_repo_url, submissionId)

    // Step 2: Read file contents (original, unsanitized)
    const fileContents = {}
    for (const filePath of repoAnalysis.files.slice(0, 50)) {
      // Limit to first 50 files
      const content = await githubService.readFile(repoAnalysis.repoPath, filePath)
      if (content) {
        fileContents[filePath] = content
      }
    }

    console.log(`Read ${Object.keys(fileContents).length} files from repository`)

    // Step 3: Sanitize data for AI
    const sanitizedData = await sanitizationService.sanitizeRepository(repoAnalysis, fileContents)

    console.log(
      `Sanitization complete. Removed ${sanitizedData.piiDetected.emails} emails, ${sanitizedData.piiDetected.phones} phones, ${sanitizedData.piiDetected.names} names`,
    )

    // Step 4: Generate AI evaluation
    let aiResult
    try {
      aiResult = await evaluationService.generateEvaluation(project, sanitizedData)
    } catch (error) {
      console.error("⚠️AI evaluation failed, using fallback:", error)
      aiResult = evaluationService.generateFallbackEvaluation(project)
    }

    // Step 5: Store evaluation in database
    const evaluation = await Evaluation.create({
      submission_id: submissionId,
      evaluation_type: aiResult.error ? "fallback" : "ai_generated",
      overall_score: aiResult.evaluation.overallScore,
      what_worked_well: aiResult.evaluation.whatWorkedWell,
      opportunities_for_improvement: aiResult.evaluation.opportunitiesForImprovement,
      development_observations: {
        commits: sanitizedData.gitStats.commitActivity,
        branches: sanitizedData.gitStats.branches,
        commitQuality: sanitizedData.gitStats.commitQuality,
      },
      ai_model_used: aiResult.aiModel,
      evaluated_by_staff_id: null,
    })

    // Step 6: Store criterion scores
    for (const criterionScore of aiResult.evaluation.criterionScores) {
      await CriterionScore.create({
        evaluation_id: evaluation.id,
        criterion_id: criterionScore.criterionId,
        score: criterionScore.score,
        reasoning: criterionScore.reasoning,
        code_references: criterionScore.codeReferences || [],
      })
    }

    // Step 7: Clean up cloned repository
    await githubService.deleteRepository(repoAnalysis.repoPath)

    // Step 8: Update submission status
    await Submission.updateStatus(submissionId, "ai_complete")

    console.log(`Evaluation complete for submission ${submissionId}. Score: ${evaluation.overall_score}`)
  }
}

// Create singleton instance
const worker = new EvaluationWorker()

module.exports = worker
