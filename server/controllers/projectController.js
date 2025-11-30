const Project = require("../models/Project")
const ProjectCriteria = require("../models/ProjectCriteria")

const projectController = {
  async getAllProjects(req, res, next) {
    try {
      const projects = await Project.findAll()
      res.json({
        success: true,
        projects,
      })
    } catch (error) {
      next(error)
    }
  },

  async getProject(req, res, next) {
    try {
      const { id } = req.params
      const project = await Project.getWithCriteria(id)

      if (!project) {
        return res.status(404).json({
          error: "PROJECT_NOT_FOUND",
          message: "Project not found",
        })
      }

      res.json({
        success: true,
        project,
      })
    } catch (error) {
      next(error)
    }
  },

  async createProject(req, res, next) {
    try {
      const { project_number, name, description, expected_timeline_days, tech_stack, criteria } = req.body

      console.log("⏳Creating project:", { project_number, name })

      // Validate required fields
      if (!project_number || !name || !description) {
        return res.status(400).json({
          error: "MISSING_FIELDS",
          message: "Project number, name, and description are required",
        })
      }

      // Check if project number already exists
      const existing = await Project.findByNumber(project_number)
      if (existing) {
        console.log("⚠️Project number already exists:", project_number)
        return res.status(409).json({
          error: "PROJECT_EXISTS",
          message: `Project #${project_number} already exists`,
        })
      }

      // Create project
      const project = await Project.create({
        project_number,
        name,
        description,
        expected_timeline_days,
        tech_stack: tech_stack || [],
      })

      console.log("✅Project created:", project.id)

      // Create criteria if provided
      if (criteria && Array.isArray(criteria) && criteria.length > 0) {
        console.log("⏳Creating criteria:", criteria.length)
        await ProjectCriteria.bulkCreate(project.id, criteria)
      }

      // Return complete project with criteria
      const completeProject = await Project.getWithCriteria(project.id)

      res.status(201).json({
        success: true,
        id: completeProject.id,
        project: completeProject,
      })
    } catch (error) {
      console.error("Project creation error:", error)
      next(error)
    }
  },

  async updateProject(req, res, next) {
    try {
      const { id } = req.params
      const { name, description, expected_timeline_days, tech_stack } = req.body

      console.log("⏳Updating project:", id)

      const project = await Project.findById(id)
      if (!project) {
        return res.status(404).json({
          error: "PROJECT_NOT_FOUND",
          message: "Project not found",
        })
      }

      const updated = await Project.update(id, {
        name,
        description,
        expected_timeline_days,
        tech_stack,
      })

      console.log("✅Project updated:", id)

      res.json({
        success: true,
        project: updated,
      })
    } catch (error) {
      console.error("Project update error:", error)
      next(error)
    }
  },

  async deleteProject(req, res, next) {
    try {
      const { id } = req.params

      const project = await Project.findById(id)
      if (!project) {
        return res.status(404).json({
          error: "PROJECT_NOT_FOUND",
          message: "Project not found",
        })
      }

      await Project.delete(id)

      res.json({
        success: true,
        message: "Project deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  },

  async getCriteria(req, res, next) {
    try {
      const { projectId } = req.params

      const project = await Project.findById(projectId)
      if (!project) {
        return res.status(404).json({
          error: "PROJECT_NOT_FOUND",
          message: "Project not found",
        })
      }

      const criteria = await ProjectCriteria.findByProjectId(projectId)

      res.json({
        success: true,
        criteria,
      })
    } catch (error) {
      next(error)
    }
  },

  async addCriteria(req, res, next) {
    try {
      const { projectId } = req.params
      const criteriaData = req.body

      console.log("⏳Adding criteria to project:", projectId)

      const requiredFields = ["criterion_name", "category", "weight", "rubric_1", "rubric_2", "rubric_3", "rubric_4"]
      const missingFields = requiredFields.filter((field) => !criteriaData[field])

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: "MISSING_FIELDS",
          message: `Missing required fields: ${missingFields.join(", ")}`,
          required: requiredFields,
        })
      }

      const project = await Project.findById(projectId)
      if (!project) {
        return res.status(404).json({
          error: "PROJECT_NOT_FOUND",
          message: "Project not found",
        })
      }

      const criteria = await ProjectCriteria.create({
        project_id: projectId,
        ...criteriaData,
      })

      console.log("✅Criteria created:", criteria.id)

      res.status(201).json({
        success: true,
        criteria,
      })
    } catch (error) {
      console.error("Add criteria error:", error)
      next(error)
    }
  },

  async updateCriteria(req, res, next) {
    try {
      const { projectId, criteriaId } = req.params
      const criteriaData = req.body

      console.log("⏳Updating criteria:", criteriaId, "for project:", projectId)

      const existing = await ProjectCriteria.findById(criteriaId)
      if (!existing) {
        return res.status(404).json({
          error: "CRITERIA_NOT_FOUND",
          message: "Criteria not found",
        })
      }

      if (existing.project_id !== projectId) {
        return res.status(400).json({
          error: "CRITERIA_MISMATCH",
          message: "Criteria does not belong to this project",
        })
      }

      const updated = await ProjectCriteria.update(criteriaId, criteriaData)

      console.log("✅Criteria updated:", criteriaId)

      res.json({
        success: true,
        criteria: updated,
      })
    } catch (error) {
      console.error("Update criteria error:", error)
      next(error)
    }
  },

  async deleteCriteria(req, res, next) {
    try {
      const { projectId, criteriaId } = req.params

      console.log("🗑️Deleting criteria:", criteriaId, "from project:", projectId)

      const existing = await ProjectCriteria.findById(criteriaId)
      if (!existing) {
        return res.status(404).json({
          error: "CRITERIA_NOT_FOUND",
          message: "Criteria not found",
        })
      }

      if (existing.project_id !== projectId) {
        return res.status(400).json({
          error: "CRITERIA_MISMATCH",
          message: "Criteria does not belong to this project",
        })
      }

      await ProjectCriteria.delete(criteriaId)

      console.log("🗑️Criteria deleted:", criteriaId)

      res.json({
        success: true,
        message: "Criteria deleted successfully",
      })
    } catch (error) {
      console.error("Delete criteria error:", error)
      next(error)
    }
  },
}

module.exports = projectController
