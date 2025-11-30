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

  useEffect(() => {
    if (open && submission?.id) {
      loadEvaluation()
    }
  }, [open, submission])

  const loadEvaluation = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await submissionService.getEvaluation(submission.id)
      setEvaluation(response.evaluation || null)
    } catch (err) {
      console.error("Failed to load evaluation:", err)
      if (err.response?.status === 404) {
        setError("Evaluation not yet available. Check back soon.")
      } else {
        setError("Failed to load evaluation")
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
