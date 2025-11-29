import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { AuthProvider } from "./context/AuthContext"

// Placeholder pages - will be created in next phases
const LoginPage = () => <div>Login Page (Coming Soon)</div>
const DashboardPage = () => <div>Dashboard (Coming Soon)</div>

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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  )
}

export default App
