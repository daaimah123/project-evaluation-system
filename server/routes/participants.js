const express = require("express")
const router = express.Router()
const Participant = require("../models/Participant")
const auth = require("../middleware/auth")

// All participant routes require authentication
router.use(auth)

// Get all participants
router.get("/", async (req, res, next) => {
  try {
    const { cohortYear, status } = req.query
    const participants = await Participant.findAll({ cohortYear, status })
    res.json({ success: true, participants })
  } catch (error) {
    next(error)
  }
})

// Get single participant
router.get("/:id", async (req, res, next) => {
  try {
    const participant = await Participant.findById(req.params.id)
    if (!participant) {
      return res.status(404).json({
        error: "PARTICIPANT_NOT_FOUND",
        message: "Participant not found",
      })
    }
    res.json({ success: true, participant })
  } catch (error) {
    next(error)
  }
})

// Create participant
router.post("/", async (req, res, next) => {
  try {
    const { email, first_name, last_name, cohort_year } = req.body

    if (!email || !first_name || !last_name || !cohort_year) {
      return res.status(400).json({
        error: "MISSING_FIELDS",
        message: "Email, first name, last name, and cohort year are required",
      })
    }

    // Check if email already exists
    const existing = await Participant.findByEmail(email)
    if (existing) {
      return res.status(409).json({
        error: "PARTICIPANT_EXISTS",
        message: "Participant with this email already exists",
      })
    }

    const participant = await Participant.create(req.body)
    res.status(201).json({ success: true, participant })
  } catch (error) {
    next(error)
  }
})

// Update participant
router.put("/:id", async (req, res, next) => {
  try {
    const participant = await Participant.findById(req.params.id)
    if (!participant) {
      return res.status(404).json({
        error: "PARTICIPANT_NOT_FOUND",
        message: "Participant not found",
      })
    }

    const updated = await Participant.update(req.params.id, req.body)
    res.json({ success: true, participant: updated })
  } catch (error) {
    next(error)
  }
})

// Delete participant
router.delete("/:id", async (req, res, next) => {
  try {
    const participant = await Participant.findById(req.params.id)
    if (!participant) {
      return res.status(404).json({
        error: "PARTICIPANT_NOT_FOUND",
        message: "Participant not found",
      })
    }

    await Participant.delete(req.params.id)
    res.json({ success: true, message: "Participant deleted successfully" })
  } catch (error) {
    next(error)
  }
})

module.exports = router
