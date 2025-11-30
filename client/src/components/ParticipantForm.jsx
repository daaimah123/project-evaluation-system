"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
} from "@mui/material"
import { participantService } from "../services/participantService"

export const ParticipantForm = ({ open, participant, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    cohort_year: new Date().getFullYear(),
    status: "active",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (participant) {
      setFormData({
        email: participant.email || "",
        first_name: participant.first_name || "",
        last_name: participant.last_name || "",
        cohort_year: participant.cohort_year || new Date().getFullYear(),
        status: participant.status || "active",
      })
    } else {
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        cohort_year: new Date().getFullYear(),
        status: "active",
      })
    }
    setError(null)
  }, [participant, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cohort_year" ? Number.parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (participant) {
        await participantService.update(participant.id, formData)
      } else {
        await participantService.create(formData)
      }
      onSuccess()
    } catch (err) {
      console.error("Failed to save participant:", err)
      setError(err.response?.data?.message || "Failed to save participant. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{participant ? "Edit Participant" : "Add New Participant"}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="first_name"
                label="First Name"
                value={formData.first_name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="last_name"
                label="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                disabled={!!participant}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="cohort_year"
                label="Cohort Year"
                select
                value={formData.cohort_year}
                onChange={handleChange}
                fullWidth
                required
              >
                {yearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="status"
                label="Status"
                select
                value={formData.status}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="graduated">Graduated</MenuItem>
                <MenuItem value="withdrawn">Withdrawn</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : participant ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
