import api from "./api"

export const authService = {
  async login(email, password) {
    const response = await api.post("/api/auth/login", { email, password })
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
    }
    return response.data
  },

  async logout() {
    try {
      await api.post("/api/auth/logout")
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  },

  async getCurrentUser() {
    const response = await api.get("/api/auth/me")
    return response.data
  },

  getStoredUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  },

  getToken() {
    return localStorage.getItem("token")
  },
}
