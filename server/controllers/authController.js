const jwt = require("jsonwebtoken")
const StaffUser = require("../models/StaffUser")

const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          error: "MISSING_CREDENTIALS",
          message: "Email and password are required",
        })
      }

      // Find user
      const user = await StaffUser.findByEmail(email)
      if (!user) {
        return res.status(401).json({
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        })
      }

      // Verify password
      const isValid = await StaffUser.verifyPassword(password, user.password_hash)
      if (!isValid) {
        return res.status(401).json({
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        })
      }

      // Update last login
      await StaffUser.updateLastLogin(user.id)

      // Generate JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" },
      )

      // Return user data (without password) and token
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  async me(req, res, next) {
    try {
      // req.user is set by auth middleware
      const user = await StaffUser.findById(req.user.id)

      if (!user) {
        return res.status(404).json({
          error: "USER_NOT_FOUND",
          message: "User not found",
        })
      }

      res.json({
        success: true,
        user,
      })
    } catch (error) {
      next(error)
    }
  },

  async logout(req, res) {
    // With JWT, logout is handled client-side by removing token
    // This endpoint exists for consistency and future enhancements
    res.json({
      success: true,
      message: "Logged out successfully",
    })
  },
}

module.exports = authController
