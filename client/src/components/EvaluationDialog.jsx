"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material"
import { submissionService } from "../services/submissionService"

export const EvaluationDialog = ({ open, onClose, submission }) => {
  const [evaluation, setEvaluation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pollingInterval, setPollingInterval] = useState(null)

  useEffect(() => {
    if (open && submission?.id) {
      loadEvaluation()
      if (submission.status === "pending" || submission.status === "evaluating") {
        startPolling()
      }
    } else {
      stopPolling()
    }

    return () => stopPolling()
  }, [open, submission])

  const startPolling = () => {
    if (pollingInterval) return // Already polling

    const interval = setInterval(() => {
      loadEvaluation()
    }, 15000)

    setPollingInterval(interval)
  }

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
  }

  const loadEvaluation = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Loading evaluation for submission:", submission.id)

      const response = await submissionService.getEvaluation(submission.id)

      console.log("Evaluation response:", response)
      console.log("Evaluation data:", response.evaluation)

      setEvaluation(response.evaluation || null)
      stopPolling()
    } catch (err) {
      console.error("Failed to load evaluation:", err)
      console.error("Error response:", err.response?.data)

      if (err.response?.status === 404) {
        const hint = err.response?.data?.hint
        const status = err.response?.data?.submissionStatus || submission?.status

        if (status === "pending") {
          setError("Evaluation is queued and will start within 30-60 seconds. Expected total time: 2-4 minutes.")
        } else if (status === "evaluating") {
          setError(
            "Evaluation in progress. The AI is analyzing code and generating feedback. This typically takes 1-3 minutes. Checking again in 15 seconds...",
          )
        } else if (status === "evaluation_failed") {
          setError("Evaluation failed. Please check the server logs for details or try submitting again.")
          stopPolling()
        } else {
          setError(hint || "Evaluation not yet available. The submission may still be processing.")
          stopPolling()
        }
      } else {
        setError("Failed to load evaluation. Please try again.")
        stopPolling()
      }
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 3.5) return "success"
    if (score >= 2.5) return "warning"
    return "error"
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Evaluation Results
        {submission && (
          <Typography variant="subtitle2" color="text.secondary">
            {submission.participant_name} - {submission.project_name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="info">{error}</Alert>
        ) : evaluation ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {process.env.NODE_ENV === "development" && (
              <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
                <Typography variant="caption" component="div">
                  <strong>Debug Info:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  Overall Score: {JSON.stringify(evaluation.overall_score)}
                </Typography>
                <Typography variant="caption" component="div">
                  Strengths: {JSON.stringify(evaluation.what_worked_well?.length || 0)}
                </Typography>
                <Typography variant="caption" component="div">
                  Improvements: {JSON.stringify(evaluation.opportunities_for_improvement?.length || 0)}
                </Typography>
                <Typography variant="caption" component="div">
                  Criterion Scores: {JSON.stringify(evaluation.criterion_scores?.length || 0)}
                </Typography>
              </Alert>
            )}

            <Box>
              <Typography variant="h6" gutterBottom>
                Overall Score
              </Typography>
              <Chip
                label={evaluation.overall_score ? evaluation.overall_score.toFixed(2) : "N/A"}
                color={getScoreColor(evaluation.overall_score)}
                size="large"
              />
            </Box>

            <Divider />

            {evaluation.what_worked_well && evaluation.what_worked_well.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  What Worked Well
                </Typography>
                <List dense>
                  {evaluation.what_worked_well.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`• ${item}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {evaluation.opportunities_for_improvement && evaluation.opportunities_for_improvement.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Opportunities for Improvement
                </Typography>
                <List dense>
                  {evaluation.opportunities_for_improvement.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`• ${item}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {evaluation.criterion_scores && evaluation.criterion_scores.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Detailed Scores
                </Typography>
                {evaluation.criterion_scores.map((score) => (
                  <Box key={score.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {score.criterion_name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Chip label={`Score: ${score.score}/4`} size="small" />
                      <Chip label={score.category} size="small" variant="outlined" />
                    </Box>
                    {score.reasoning && (
                      <Typography variant="body2" color="text.secondary">
                        {score.reasoning}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            <Divider />

            <Typography variant="caption" color="text.secondary">
              Evaluated on: {new Date(evaluation.evaluated_at).toLocaleString()}
              {evaluation.ai_model_used && ` | AI Model: ${evaluation.ai_model_used}`}
            </Typography>
          </Box>
        ) : (
          <Alert severity="info">No evaluation data available</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
