"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
} from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"
import { toast } from "react-toastify"
import { projectService } from "../services/projectService"
import { ProjectTemplateForm } from "../components/ProjectTemplateForm"

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getAll()
      console.log("Projects API response:", data)

      // Handle different response formats
      if (Array.isArray(data)) {
        setProjects(data)
      } else if (data && Array.isArray(data.projects)) {
        setProjects(data.projects)
      } else {
        console.error("Unexpected projects response format:", data)
        setProjects([])
      }
    } catch (error) {
      toast.error("Failed to load projects")
      console.error("❌Error loading projects:", error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setSelectedProject(null)
    setOpenDialog(true)
  }

  const handleEdit = (project) => {
    setSelectedProject(project)
    setOpenDialog(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return
    }

    try {
      await projectService.delete(id)
      toast.success("Project deleted successfully")
      loadProjects()
    } catch (error) {
      toast.error("Failed to delete project")
      console.error(error)
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedProject(null)
  }

  const handleSaveSuccess = () => {
    handleCloseDialog()
    loadProjects()
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Project Templates
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
          Create New Project
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading projects...</Typography>
      ) : projects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first project template with evaluation criteria
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateNew}>
            Create First Project
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Tech Stack</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.project_number}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    {project.description?.substring(0, 100)}
                    {project.description?.length > 100 && "..."}
                  </TableCell>
                  <TableCell>{project.expected_timeline_days} days</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {project.tech_stack?.slice(0, 3).map((tech) => (
                        <Chip key={tech} label={tech} size="small" />
                      ))}
                      {project.tech_stack?.length > 3 && (
                        <Chip label={`+${project.tech_stack.length - 3}`} size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(project)} title="Edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(project.id)} title="Delete" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <ProjectTemplateForm project={selectedProject} onClose={handleCloseDialog} onSuccess={handleSaveSuccess} />
      </Dialog>
    </Box>
  )
}

