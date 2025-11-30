const Submission = require("../models/Submission")
const Participant = require("../models/Participant")
const Project = require("../models/Project")
const githubService = require("../services/githubService")
const queueService = require("../services/queueService")

const submissionController = {
  async getAllSubmissions(req, res, next) {
    try {
      const { status, participantId, projectId } = req.query

      const submissions = await Submission.findAll({
        status,
        participantId,
        projectId,
      })

      res.json({
        success: true,
        submissions,
      })
    } catch (error) {
      next(error)
    }
  },

  async getSubmission(req, res, next) {
    try {
      const { id } = req.params
      const submission = await Submission.findById(id)

      if (!submission) {
        return res.status(404).json({
          error: "SUBMISSION_NOT_FOUND",
          message: "Submission not found",
        })
      }

      res.json({
        success: true,
        submission,
      })
    } catch (error) {
      next(error)
    }
  },

  async createSubmission(req, res, next) {
    try {
      const { participant_id, project_id, github_repo_url, notes_from_participant } = req.body

      // Validate required fields
      if (!participant_id || !project_id || !github_repo_url) {
        return res.status(400).json({
          error: "MISSING_FIELDS",
          message: "Participant ID, project ID, and GitHub URL are required",
        })
      }

      // Validate participant exists
      const participant = await Participant.findById(participant_id)
      if (!participant) {
        return res.status(404).json({
          error: "PARTICIPANT_NOT_FOUND",
          message: "Participant not found",
        })
      }

      // Validate project exists
      const project = await Project.findById(project_id)
      if (!project) {
        return res.status(404).json({
          error: "PROJECT_NOT_FOUND",
          message: "Project not found",
        })
      }

      // Check if submission already exists for this participant/project
      const existing = await Submission.getByParticipantAndProject(participant_id, project_id)
      if (existing) {
        return res.status(409).json({
          error: "SUBMISSION_EXISTS",
          message: "Submission already exists for this participant and project",
          existingSubmission: existing,
        })
      }

      // Check repository accessibility
      console.log("🔦Checking GitHub repository access...")
      const accessCheck = await githubService.checkRepoAccess(github_repo_url)

      if (!accessCheck.accessible) {
        return res.status(403).json({
          error: accessCheck.error,
          message: "Cannot access repository",
          isPrivate: accessCheck.isPrivate,
          instructions: {
            step1: "Ask participant to add your GitHub account as a collaborator",
            step2: "Participant goes to: Repository Settings → Collaborators → Add people",
            step3: "Or ask participant to make repository temporarily public",
            step4: "Try submitting again once access is granted",
          },
        })
      }

      // Create submission
      const submission = await Submission.create({
        participant_id,
        project_id,
        github_repo_url,
        repo_visibility: accessCheck.isPrivate ? "private" : "public",
        notes_from_participant,
      })

      // Add to evaluation queue
      queueService.addEvaluation(submission.id)

      res.status(201).json({
        success: true,
        submission,
        message: accessCheck.isPrivate
          ? "Private repository accessible - queued for evaluation"
          : "Public repository - queued for evaluation",
        queueStatus: queueService.getQueueStatus(),
      })
    } catch (error) {
      next(error)
    }
  },

  async deleteSubmission(req, res, next) {
    try {
      const { id } = req.params

      const submission = await Submission.findById(id)
      if (!submission) {
        return res.status(404).json({
          error: "SUBMISSION_NOT_FOUND",
          message: "Submission not found",
        })
      }

      await Submission.delete(id)

      res.json({
        success: true,
        message: "Submission deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = submissionController
