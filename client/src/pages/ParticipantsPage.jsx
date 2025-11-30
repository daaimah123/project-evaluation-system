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
import { Edit, Delete, PersonAdd } from "@mui/icons-material"
import { participantService } from "../services/participantService"
import { ParticipantForm } from "../components/ParticipantForm"

export const ParticipantsPage = () => {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState(null)

  useEffect(() => {
    loadParticipants()
  }, [])

  const loadParticipants = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await participantService.getAll()
      const participantsArray = Array.isArray(data) ? data : data.participants || []
      setParticipants(participantsArray)
    } catch (err) {
      console.error("Failed to load participants:", err)
      setError("Failed to load participants. Please try again.")
      setParticipants([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingParticipant(null)
    setOpenForm(true)
  }

  const handleEdit = (participant) => {
    setEditingParticipant(participant)
    setOpenForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this participant?")) {
      return
    }

    try {
      await participantService.delete(id)
      await loadParticipants()
    } catch (err) {
      console.error("Failed to delete participant:", err)
      setError("Failed to delete participant. Please try again.")
    }
  }

  const handleFormClose = () => {
    setOpenForm(false)
    setEditingParticipant(null)
  }

  const handleFormSuccess = async () => {
    handleFormClose()
    await loadParticipants()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success"
      case "graduated":
        return "info"
      case "withdrawn":
        return "default"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <Box>
        <Typography>Loading participants...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Participants
        </Typography>
        <Button variant="contained" startIcon={<PersonAdd />} onClick={handleCreate}>
          Add Participant
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Cohort Year</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Enrollment Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">No participants found. Add one to get started.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>
                    {participant.first_name} {participant.last_name}
                  </TableCell>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>{participant.cohort_year}</TableCell>
                  <TableCell>
                    <Chip label={participant.status} color={getStatusColor(participant.status)} size="small" />
                  </TableCell>
                  <TableCell>{new Date(participant.enrollment_date).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(participant)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(participant.id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ParticipantForm
        open={openForm}
        participant={editingParticipant}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </Box>
  )
}
