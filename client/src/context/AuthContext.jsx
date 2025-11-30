"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/authService"
import { toast } from "react-toastify"

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken()
      const storedUser = authService.getStoredUser()

      if (token && storedUser) {
        try {
          // Verify token is still valid
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          // Token invalid, clear storage
          authService.logout()
          setUser(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      setUser(data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      return data
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      toast.success("Logged out successfully")
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
