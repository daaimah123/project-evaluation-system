const express = require("express")
const router = express.Router()
const projectController = require("../controllers/projectController")
const auth = require("../middleware/auth")

// All project routes require authentication
router.use(auth)

// Project CRUD
router.get("/", projectController.getAllProjects)
router.get("/:id", projectController.getProject)
router.post("/", projectController.createProject)
router.put("/:id", projectController.updateProject)
router.delete("/:id", projectController.deleteProject)

// Criteria management
router.post("/:projectId/criteria", projectController.addCriteria)
router.put("/criteria/:criteriaId", projectController.updateCriteria)
router.delete("/criteria/:criteriaId", projectController.deleteCriteria)

module.exports = router
