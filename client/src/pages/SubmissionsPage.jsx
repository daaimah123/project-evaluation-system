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
  Alert,
} from "@mui/material"
import { Add as AddIcon, Visibility as ViewIcon, Delete as DeleteIcon } from "@mui/icons-material"
import { submissionService } from "../services/submissionService"
import { SubmissionForm } from "../components/SubmissionForm"
import { EvaluationDialog } from "../components/EvaluationDialog"

export const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  useEffect(() => {
    loadSubmissions()
  }, [])

  useEffect(() => {
    const hasActiveEvaluations = submissions.some((sub) => sub.status === "pending" || sub.status === "evaluating")

    if (!hasActiveEvaluations) {
      return
    }

    // Refresh every 30 seconds if there are active evaluations
    const interval = setInterval(() => {
      loadSubmissions()
    }, 30000)

    return () => clearInterval(interval)
  }, [submissions])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await submissionService.getAll()
      const data = Array.isArray(response) ? response : response.submissions || []
      setSubmissions(data)
    } catch (err) {
      console.error("Failed to load submissions:", err)
      setError("Failed to load submissions")
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) {
      return
    }

    try {
      await submissionService.delete(id)
      loadSubmissions()
    } catch (err) {
      console.error("Failed to delete submission:", err)
      alert("Failed to delete submission")
    }
  }

  const handleViewEvaluation = (submission) => {
    setSelectedSubmission(submission)
    setEvaluationDialogOpen(true)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "default",
      evaluating: "info",
      ai_complete: "primary",
      staff_reviewing: "warning",
      staff_approved: "success",
      ready_to_share: "success",
      evaluation_failed: "error", // Add error color for failed evaluations
    }
    return colors[status] || "default"
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Submissions
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          New Submission
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading submissions...</Typography>
      ) : submissions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            No submissions yet. Create your first submission to get started.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Participant</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>GitHub URL</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.participant_name || "Unknown"}</TableCell>
                  <TableCell>{submission.project_name || "Unknown"}</TableCell>
                  <TableCell>
                    <a
                      href={submission.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      {submission.github_repo_url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={submission.status.replace(/_/g, " ")}
                      color={getStatusColor(submission.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(submission.submission_date)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewEvaluation(submission)}
                      title="View Evaluation"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(submission.id)} title="Delete">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <SubmissionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false)
          loadSubmissions()
        }}
      />

      <EvaluationDialog
        open={evaluationDialogOpen}
        onClose={() => setEvaluationDialogOpen(false)}
        submission={selectedSubmission}
      />
    </Box>
  )
}
