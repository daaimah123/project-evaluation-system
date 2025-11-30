"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Box, CircularProgress } from "@mui/material"

export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}
