"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import DashboardIcon from "@mui/icons-material/Dashboard"
import AssignmentIcon from "@mui/icons-material/Assignment"
import FolderIcon from "@mui/icons-material/Folder"
import PeopleIcon from "@mui/icons-material/People"
import LogoutIcon from "@mui/icons-material/Logout"
import { useAuth } from "../context/AuthContext"

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Submissions", path: "/submissions", icon: <AssignmentIcon /> },
  { label: "Projects", path: "/projects", icon: <FolderIcon /> },
  { label: "Participants", path: "/participants", icon: <PeopleIcon /> },
]

export const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleNavigation = (path) => {
    navigate(path)
    setDrawerOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton selected={location.pathname === item.path} onClick={() => handleNavigation(item.path)}>
              <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>{item.icon}</Box>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
              <LogoutIcon />
            </Box>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Project Evaluation System
          </Typography>

          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderBottom: location.pathname === item.path ? "2px solid white" : "2px solid transparent",
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                Logout
              </Button>
            </Box>
          )}

          {user && !isMobile && (
            <Typography variant="body2" sx={{ ml: 2 }}>
              {user.name}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>
    </>
  )
}
