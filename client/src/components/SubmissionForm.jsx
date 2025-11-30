"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material"
import { submissionService } from "../services/submissionService"
import { participantService } from "../services/participantService"
import { projectService } from "../services/projectService"

export const SubmissionForm = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    participant_id: "",
    project_id: "",
    github_repo_url: "",
    notes_from_participant: "",
  })
  const [participants, setParticipants] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [accessCheckResult, setAccessCheckResult] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    if (open) {
      loadParticipants()
      loadProjects()
    }
  }, [open])

  const loadParticipants = async () => {
    try {
      const response = await participantService.getAll()
      const data = Array.isArray(response) ? response : response.participants || []
      setParticipants(data)
    } catch (err) {
      console.error("Failed to load participants:", err)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll()
      const data = Array.isArray(response) ? response : response.projects || []
      setProjects(data)
    } catch (err) {
      console.error("Failed to load projects:", err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setAccessCheckResult(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setAccessCheckResult(null)
    setSuccessMessage(null)

    try {
      const response = await submissionService.create(formData)
      console.log("Submission created:", response)

      if (response.success) {
        setSuccessMessage(
          "Submission created successfully! The evaluation has been queued and will begin processing shortly (30-60 seconds). The evaluation typically takes 1-3 minutes to complete.",
        )

        setTimeout(() => {
          onSuccess()
        }, 3000)
      }
    } catch (err) {
      console.error("Submission error:", err)

      if (err.response?.status === 403) {
        setAccessCheckResult({
          accessible: false,
          isPrivate: err.response.data.isPrivate,
          instructions: err.response.data.instructions,
        })
        setError(err.response.data.message || "Repository access denied")
      } else if (err.response?.status === 409) {
        setError("A submission already exists for this participant and project")
      } else {
        setError(err.response?.data?.message || "Failed to create submission")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      participant_id: "",
      project_id: "",
      github_repo_url: "",
      notes_from_participant: "",
    })
    setError(null)
    setAccessCheckResult(null)
    setSuccessMessage(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Submission</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {successMessage && <Alert severity="success">{successMessage}</Alert>}

            {error && <Alert severity="error">{error}</Alert>}

            {accessCheckResult && !accessCheckResult.accessible && (
              <Alert severity="warning">
                <strong>Private Repository Detected</strong>
                <br />
                {accessCheckResult.instructions?.step1}
                <br />
                {accessCheckResult.instructions?.step2}
                <br />
                {accessCheckResult.instructions?.step3}
              </Alert>
            )}

            <TextField
              select
              fullWidth
              label="Participant"
              name="participant_id"
              value={formData.participant_id}
              onChange={handleChange}
              required
              disabled={loading || successMessage}
            >
              <MenuItem value="">Select Participant</MenuItem>
              {participants.map((participant) => (
                <MenuItem key={participant.id} value={participant.id}>
                  {participant.name} ({participant.email})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Project"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              required
              disabled={loading || successMessage}
            >
              <MenuItem value="">Select Project</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  Project {project.project_number}: {project.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="GitHub Repository URL"
              name="github_repo_url"
              value={formData.github_repo_url}
              onChange={handleChange}
              placeholder="https://github.com/username/repo"
              required
              disabled={loading || successMessage}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes from Participant (Optional)"
              name="notes_from_participant"
              value={formData.notes_from_participant}
              onChange={handleChange}
              disabled={loading || successMessage}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {successMessage ? "Close" : "Cancel"}
          </Button>
          {!successMessage && (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  )
}
