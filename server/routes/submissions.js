const express = require("express")
const router = express.Router()
const submissionController = require("../controllers/submissionController")
const evaluationController = require("../controllers/evaluationController")
const auth = require("../middleware/auth")

// All submission routes require authentication
router.use(auth)

router.get("/", submissionController.getAllSubmissions)
router.get("/:id", submissionController.getSubmission)
router.post("/", submissionController.createSubmission)
router.delete("/:id", submissionController.deleteSubmission)

router.get("/:submissionId/evaluation", evaluationController.getEvaluationBySubmission)
router.put("/evaluations/:id", evaluationController.updateEvaluation)

module.exports = router
