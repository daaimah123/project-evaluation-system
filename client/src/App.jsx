import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { AuthProvider } from "./context/AuthContext"
import { PrivateRoute } from "./components/PrivateRoute"
import { Layout } from "./components/Layout"
import { LoginPage } from "./pages/LoginPage"
import { DashboardPage } from "./pages/DashboardPage"
import { ProjectsPage } from "./pages/ProjectsPage"
import { SubmissionsPage } from "./pages/SubmissionsPage"
import { ParticipantsPage } from "./pages/ParticipantsPage"

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <Layout>
                    <ProjectsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/submissions"
              element={
                <PrivateRoute>
                  <Layout>
                    <SubmissionsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/participants"
              element={
                <PrivateRoute>
                  <Layout>
                    <ParticipantsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  )
}

export default App
