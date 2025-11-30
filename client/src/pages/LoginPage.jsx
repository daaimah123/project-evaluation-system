"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, Card, CardContent, TextField, Button, Typography, Container } from "@mui/material"
import { useAuth } from "../context/AuthContext"

export const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (error) {
      // Error handled by AuthContext with toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Project Evaluation System
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Staff Login
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 3 }}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
