const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const auth = require("../middleware/auth")

// Public routes
router.post("/login", authController.login)
router.post("/logout", authController.logout)

// Protected routes
router.get("/me", auth, authController.me)

module.exports = router
