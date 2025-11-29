const express = require("express")
const router = express.Router()
const submissionController = require("../controllers/submissionController")
const auth = require("../middleware/auth")

// All submission routes require authentication
router.use(auth)

router.get("/", submissionController.getAllSubmissions)
router.get("/:id", submissionController.getSubmission)
router.post("/", submissionController.createSubmission)
router.delete("/:id", submissionController.deleteSubmission)

module.exports = router
