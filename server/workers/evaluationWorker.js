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
      console.log("Evaluation worker already running")
      return
    }

    this.isRunning = true
    console.log("🚀 EVALUATION WORKER STARTING...")
    console.log("Worker will check queue every 30 seconds")

    // Process queue every 30 seconds
    this.interval = setInterval(() => {
      this.processQueue()
    }, 30000)

    // Process immediately on start
    console.log("Processing queue immediately on startup...")
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
    console.log("Evaluation worker stopped")
  }

  /**
   * Process next job in queue
   */
  async processQueue() {
    console.log("🔍 Checking queue for pending jobs...")
    const job = queueService.getNextJob()

    if (!job) {
      console.log("No jobs in queue")
      return
    }

    console.log(`📋 Found job: ${job.submissionId}`)
    console.log(`Processing job: ${job.submissionId}`)

    try {
      await this.evaluateSubmission(job.submissionId)
      queueService.completeJob(job.submissionId, true)
      console.log(`✅ Job ${job.submissionId} completed successfully`)
    } catch (error) {
      console.error(`❌ Evaluation failed for submission ${job.submissionId}:`, error)
      console.error("Error stack:", error.stack)
      queueService.failJob(job.submissionId, error)

      try {
        await Submission.updateStatus(job.submissionId, "evaluation_failed")
        console.log(`Updated submission ${job.submissionId} status to evaluation_failed`)
      } catch (statusError) {
        console.error(`Failed to update submission status:`, statusError)
      }
    }
  }

  /**
   * Complete evaluation pipeline for a submission
   */
  async evaluateSubmission(submissionId) {
    console.log(`\n${"=".repeat(60)}`)
    console.log(`STARTING EVALUATION: ${submissionId}`)
    console.log(`${"=".repeat(60)}\n`)

    // Update status to evaluating
    await Submission.updateStatus(submissionId, "evaluating")
    console.log("✓ Status updated to 'evaluating'")

    // Get submission details
    const submission = await Submission.findById(submissionId)
    if (!submission) {
      throw new Error("Submission not found")
    }
    console.log(`✓ Found submission for project: ${submission.project_name}`)

    // Get project with criteria
    const project = await Project.getWithCriteria(submission.project_id)
    if (!project) {
      throw new Error("Project not found")
    }
    console.log(`✓ Loaded project with ${project.criteria?.length || 0} criteria`)

    console.log(`\n🔦 Analyzing repository: ${submission.github_repo_url}`)

    // Step 1: Clone and analyze repository
    const repoAnalysis = await githubService.analyzeRepository(submission.github_repo_url, submissionId)
    console.log(`✓ Repository cloned and analyzed`)

    // Step 2: Read file contents (original, unsanitized)
    const fileContents = {}
    for (const filePath of repoAnalysis.files.slice(0, 50)) {
      // Limit to first 50 files
      const content = await githubService.readFile(repoAnalysis.repoPath, filePath)
      if (content) {
        fileContents[filePath] = content
      }
    }

    console.log(`✓ Read ${Object.keys(fileContents).length} files from repository`)

    // Step 3: Sanitize data for AI
    const sanitizedData = await sanitizationService.sanitizeRepository(repoAnalysis, fileContents)

    console.log(`✓ Sanitization complete:`)
    console.log(`  - Emails removed: ${sanitizedData.piiDetected.emails}`)
    console.log(`  - Phones removed: ${sanitizedData.piiDetected.phones}`)
    console.log(`  - Names removed: ${sanitizedData.piiDetected.names}`)

    // Step 4: Generate AI evaluation
    console.log(`\n🤖 Calling Gemini AI for evaluation...`)
    let aiResult
    try {
      aiResult = await evaluationService.generateEvaluation(project, sanitizedData)
      console.log(`✓ AI evaluation completed successfully`)
    } catch (error) {
      console.error("❌ AI evaluation failed:", error.message)
      console.log("⚠️  Using fallback evaluation")
      aiResult = evaluationService.generateFallbackEvaluation(project)
    }

    const evaluationData = {
      submission_id: submissionId,
      evaluation_type: "ai_generated",
      overall_score: Number.parseFloat(aiResult.evaluation.overallScore) || 0,
      what_worked_well: aiResult.evaluation.whatWorkedWell || [],
      opportunities_for_improvement: aiResult.evaluation.opportunitiesForImprovement || [],
      development_observations: {
        commits: sanitizedData.gitStats.commitActivity,
        branches: sanitizedData.gitStats.branches,
        commit_quality: sanitizedData.gitStats.commitQuality,
        evaluation_error: aiResult.error || false,
        error_message: aiResult.error ? "AI evaluation service failed, fallback evaluation used" : null,
      },
      ai_model_used: aiResult.aiModel,
      evaluated_by_staff_id: null,
    }

    console.log(`\n📊 Evaluation Results:`)
    console.log(`  - Overall score: ${evaluationData.overall_score}`)
    console.log(`  - Strengths: ${evaluationData.what_worked_well.length}`)
    console.log(`  - Improvements: ${evaluationData.opportunities_for_improvement.length}`)
    console.log(`  - Criterion scores: ${aiResult.evaluation.criterionScores.length}`)

    // Step 5: Store evaluation in database
    console.log(`\n💾 Storing evaluation in database...`)
    const evaluation = await Evaluation.create(evaluationData)
    console.log(`✓ Evaluation stored with ID: ${evaluation.id}`)

    // Step 6: Store criterion scores with proper UUID mapping
    console.log(`💾 Storing ${aiResult.evaluation.criterionScores.length} criterion scores...`)

    // Create a map of criterion IDs from project.criteria
    const criteriaMap = new Map()

    if (project.criteria && Array.isArray(project.criteria)) {
      console.log(`✓ Found ${project.criteria.length} criteria in project`)

      for (const criterion of project.criteria) {
        // Store by actual UUID
        criteriaMap.set(criterion.id, criterion.id)

        // Store by criterion name variations for matching
        const criterionName = criterion.criterion_name || ""
        const normalizedName = criterionName.toLowerCase().replace(/\s+/g, "_")
        const snakeCaseName = criterionName
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "")

        criteriaMap.set(normalizedName, criterion.id)
        criteriaMap.set(snakeCaseName, criterion.id)
        criteriaMap.set(criterionName.toLowerCase(), criterion.id)
        criteriaMap.set(criterionName, criterion.id)

        console.log(`   - Mapped "${criterionName}" → ${criterion.id}`)
        console.log(`     (also: ${normalizedName}, ${snakeCaseName})`)
      }
    } else {
      console.warn(`⚠️  No criteria found in project!`)
    }

    for (const criterionScore of aiResult.evaluation.criterionScores) {
      try {
        console.log(`\n🔍 Processing criterion score:`)
        console.log(`   AI returned criterionId: "${criterionScore.criterionId}"`)
        console.log(`   AI returned criterionName: "${criterionScore.criterionName}"`)
        console.log(`   AI returned score: ${criterionScore.score}`)

        // Try to find matching criterion UUID
        let actualCriterionId = null

        // Strategy 1: Direct UUID match (if AI somehow returns correct UUID)
        if (criteriaMap.has(criterionScore.criterionId)) {
          actualCriterionId = criteriaMap.get(criterionScore.criterionId)
          console.log(`   ✓ Strategy 1 SUCCESS: Direct UUID match`)
        }
        // Strategy 2: Try normalized criterionId
        else {
          const normalizedId = criterionScore.criterionId.toLowerCase().replace(/\s+/g, "_")
          if (criteriaMap.has(normalizedId)) {
            actualCriterionId = criteriaMap.get(normalizedId)
            console.log(`   ✓ Strategy 2 SUCCESS: Normalized ID match (${normalizedId})`)
          }
          // Strategy 3: Try normalized criterionName
          else if (criterionScore.criterionName) {
            const normalizedName = criterionScore.criterionName.toLowerCase().replace(/\s+/g, "_")
            if (criteriaMap.has(normalizedName)) {
              actualCriterionId = criteriaMap.get(normalizedName)
              console.log(`   ✓ Strategy 3 SUCCESS: Normalized name match (${normalizedName})`)
            }
            // Strategy 4: Try exact criterionName match
            else if (criteriaMap.has(criterionScore.criterionName)) {
              actualCriterionId = criteriaMap.get(criterionScore.criterionName)
              console.log(`   ✓ Strategy 4 SUCCESS: Exact name match`)
            }
          }
        }

        if (!actualCriterionId) {
          console.error(`   ❌ FAILED: Could not find matching criterion UUID`)
          console.error(`   Available mappings:`, Array.from(criteriaMap.keys()))
          console.log(`   Skipping this criterion score...`)
          continue
        }

        console.log(`   → Using UUID: ${actualCriterionId}`)

        await CriterionScore.create({
          evaluation_id: evaluation.id,
          criterion_id: actualCriterionId,
          score: criterionScore.score,
          reasoning: criterionScore.reasoning,
          code_references: criterionScore.codeReferences || [],
        })

        console.log(`   ✓ Criterion score stored successfully`)
      } catch (scoreError) {
        console.error(`   ❌ Error storing criterion score:`, scoreError.message)
        console.error(`   Continuing with next score...`)
      }
    }

    console.log(`\n✓ Criterion score processing complete`)

    // Step 7: Clean up cloned repository
    await githubService.deleteRepository(repoAnalysis.repoPath)
    console.log(`✓ Repository cleanup complete`)

    // Step 8: Update submission status
    await Submission.updateStatus(submissionId, "ai_complete")
    console.log(`✓ Status updated to 'ai_complete'`)

    console.log(`\n${"=".repeat(60)}`)
    console.log(`✅ EVALUATION COMPLETE: ${submissionId}`)
    console.log(`   Final Score: ${evaluation.overall_score}/4.0`)
    console.log(`${"=".repeat(60)}\n`)
  }
}

// Create singleton instance
const worker = new EvaluationWorker()

module.exports = worker
