"use client"

import { useState, useEffect } from "react"
import {
  Box,
  TextField,
  Button,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Paper,
  Divider,
} from "@mui/material"
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material"
import { toast } from "react-toastify"
import { projectService } from "../services/projectService"

const CRITERION_CATEGORIES = [
  "Technical Implementation",
  "Code Quality",
  "User Experience",
  "Documentation",
  "Testing",
  "Performance",
  "Security",
  "Accessibility",
]

export const ProjectTemplateForm = ({ project, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    project_number: "",
    name: "",
    description: "",
    expected_timeline_days: "",
    tech_stack: [],
  })
  const [techInput, setTechInput] = useState("")
  const [criteria, setCriteria] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (project) {
      setFormData({
        project_number: project.project_number || "",
        name: project.name || "",
        description: project.description || "",
        expected_timeline_days: project.expected_timeline_days || "",
        tech_stack: project.tech_stack || [],
      })
      loadCriteria()
    } else {
      // Initialize with one empty criterion
      setCriteria([createEmptyCriterion()])
    }
  }, [project])

  const loadCriteria = async () => {
    if (!project?.id) return

    try {
      const data = await projectService.getCriteria(project.id)
      if (data.length > 0) {
        setCriteria(data)
      } else {
        setCriteria([createEmptyCriterion()])
      }
    } catch (error) {
      console.error("Failed to load criteria:", error)
      setCriteria([createEmptyCriterion()])
    }
  }

  const createEmptyCriterion = () => ({
    category: "",
    criterion_name: "",
    weight: 1,
    rubric_1: "",
    rubric_2: "",
    rubric_3: "",
    rubric_4: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddTech = () => {
    if (techInput.trim() && !formData.tech_stack.includes(techInput.trim())) {
      setFormData({
        ...formData,
        tech_stack: [...formData.tech_stack, techInput.trim()],
      })
      setTechInput("")
    }
  }

  const handleDeleteTech = (techToDelete) => {
    setFormData({
      ...formData,
      tech_stack: formData.tech_stack.filter((tech) => tech !== techToDelete),
    })
  }

  const handleCriterionChange = (index, field, value) => {
    const newCriteria = [...criteria]
    newCriteria[index] = {
      ...newCriteria[index],
      [field]: value,
    }
    setCriteria(newCriteria)
  }

  const handleAddCriterion = () => {
    setCriteria([...criteria, createEmptyCriterion()])
  }

  const handleDeleteCriterion = (index) => {
    if (criteria.length === 1) {
      toast.error("Must have at least one criterion")
      return
    }
    setCriteria(criteria.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Project name is required")
      return false
    }

    if (!formData.project_number || formData.project_number < 1) {
      toast.error("Valid project number is required")
      return false
    }

    if (criteria.length === 0) {
      toast.error("At least one criterion is required")
      return false
    }

    for (let i = 0; i < criteria.length; i++) {
      const c = criteria[i]
      if (!c.category || !c.criterion_name) {
        toast.error(`Criterion ${i + 1}: Category and criterion name are required`)
        return false
      }
      if (!c.rubric_1 || !c.rubric_2 || !c.rubric_3 || !c.rubric_4) {
        toast.error(`Criterion ${i + 1}: All rubric levels (1-4) must be filled`)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      // Create or update project
      let projectId
      if (project?.id) {
        await projectService.update(project.id, formData)
        projectId = project.id
        toast.success("Project updated successfully")
      } else {
        const newProject = await projectService.create(formData)
        projectId = newProject.id || newProject.project?.id
        toast.success("Project created successfully")
      }

      // Ensure projectId exists before creating criteria
      if (!projectId) {
        throw new Error("Failed to get project ID")
      }

      // Create criteria for new criteria that don't have IDs
      for (const criterion of criteria) {
        if (!criterion.id) {
          await projectService.createCriterion(projectId, criterion)
        }
      }

      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save project")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>{project ? "Edit Project Template" : "Create New Project Template"}</DialogTitle>

      <DialogContent dividers>
        {/* Basic Information */}
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Project Number"
              name="project_number"
              type="number"
              value={formData.project_number}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Expected Timeline (days)"
              name="expected_timeline_days"
              type="number"
              value={formData.expected_timeline_days}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                label="Add Technology"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTech()
                  }
                }}
              />
              <Button onClick={handleAddTech} variant="outlined">
                Add
              </Button>
            </Box>
          </Grid>
          {formData.tech_stack.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {formData.tech_stack.map((tech) => (
                  <Chip key={tech} label={tech} onDelete={() => handleDeleteTech(tech)} />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Evaluation Criteria */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Evaluation Criteria</Typography>
          <Button startIcon={<AddIcon />} onClick={handleAddCriterion} variant="outlined" size="small">
            Add Criterion
          </Button>
        </Box>

        {criteria.map((criterion, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Criterion {index + 1}
              </Typography>
              {criteria.length > 1 && (
                <IconButton size="small" onClick={() => handleDeleteCriterion(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={criterion.category}
                    label="Category"
                    onChange={(e) => handleCriterionChange(index, "category", e.target.value)}
                  >
                    {CRITERION_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Criterion Name"
                  value={criterion.criterion_name}
                  onChange={(e) => handleCriterionChange(index, "criterion_name", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Weight"
                  type="number"
                  value={criterion.weight}
                  onChange={(e) => handleCriterionChange(index, "weight", Number.parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 5 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Rubric Levels
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Level 1 (Needs Improvement)"
                  value={criterion.rubric_1}
                  onChange={(e) => handleCriterionChange(index, "rubric_1", e.target.value)}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Level 2 (Developing)"
                  value={criterion.rubric_2}
                  onChange={(e) => handleCriterionChange(index, "rubric_2", e.target.value)}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Level 3 (Proficient)"
                  value={criterion.rubric_3}
                  onChange={(e) => handleCriterionChange(index, "rubric_3", e.target.value)}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Level 4 (Exemplary)"
                  value={criterion.rubric_4}
                  onChange={(e) => handleCriterionChange(index, "rubric_4", e.target.value)}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Saving..." : project ? "Update Project" : "Create Project"}
        </Button>
      </DialogActions>
    </Box>
  )
}
