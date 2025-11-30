"use client"

import { Box, Typography, Grid, Card, CardContent, Button } from "@mui/material"
import { useNavigate } from "react-router-dom"
import AssignmentIcon from "@mui/icons-material/Assignment"
import FolderIcon from "@mui/icons-material/Folder"
import PeopleIcon from "@mui/icons-material/People"

export const DashboardPage = () => {
  const navigate = useNavigate()

  const cards = [
    {
      title: "Submissions",
      description: "View and manage project submissions",
      icon: <AssignmentIcon sx={{ fontSize: 48 }} />,
      path: "/submissions",
      color: "#1976d2",
    },
    {
      title: "Projects",
      description: "Manage project templates and criteria",
      icon: <FolderIcon sx={{ fontSize: 48 }} />,
      path: "/projects",
      color: "#2e7d32",
    },
    {
      title: "Participants",
      description: "View participant progress and details",
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      path: "/participants",
      color: "#ed6c02",
    },
  ]

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome to the Project Evaluation System
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {cards.map((card) => (
          <Grid item xs={12} md={4} key={card.title}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                <Box sx={{ color: card.color, mb: 2 }}>{card.icon}</Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {card.description}
                </Typography>
                <Button variant="contained" onClick={() => navigate(card.path)} sx={{ mt: 2, bgcolor: card.color }}>
                  Go to {card.title}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
