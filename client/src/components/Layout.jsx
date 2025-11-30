import { Box } from "@mui/material"
import { Navbar } from "./Navbar"

export const Layout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "grey.50" }}>
        {children}
      </Box>
    </Box>
  )
}
