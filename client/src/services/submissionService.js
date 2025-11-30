import api from "./api"

export const submissionService = {
  async getAll(filters = {}) {
    console.log("submissionService.getAll called with filters:", filters)
    try {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/api/submissions?${params}`)
      console.log("submissionService.getAll response:", response.data)
      return response.data
    } catch (error) {
      console.error("submissionService.getAll error:", error)
      throw error
    }
  },

  async getById(id) {
    console.log("submissionService.getById called with:", id)
    try {
      const response = await api.get(`/api/submissions/${id}`)
      console.log("submissionService.getById response:", response.data)
      return response.data
    } catch (error) {
      console.error("submissionService.getById error:", error)
      throw error
    }
  },

  async create(submissionData) {
    console.log("submissionService.create called with:", submissionData)
    try {
      const response = await api.post("/api/submissions", submissionData)
      console.log("submissionService.create response:", response.data)
      return response.data
    } catch (error) {
      console.error("submissionService.create error:", error)
      throw error
    }
  },

  async getEvaluation(submissionId) {
    console.log("submissionService.getEvaluation called with:", submissionId)
    try {
      const response = await api.get(`/api/submissions/${submissionId}/evaluation`)
      console.log("submissionService.getEvaluation response:", response.data)
      return response.data
    } catch (error) {
      console.error("submissionService.getEvaluation error:", error)
      throw error
    }
  },

  async delete(id) {
    console.log("submissionService.delete called with:", id)
    try {
      const response = await api.delete(`/api/submissions/${id}`)
      console.log("submissionService.delete response:", response.data)
      return response.data
    } catch (error) {
      console.error("submissionService.delete error:", error)
      throw error
    }
  },
}
