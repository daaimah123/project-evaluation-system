import api from "./api"

export const submissionService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/api/submissions?${params}`)
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/api/submissions/${id}`)
    return response.data
  },

  async create(submissionData) {
    const response = await api.post("/api/submissions", submissionData)
    return response.data
  },

  async update(id, submissionData) {
    const response = await api.put(`/api/submissions/${id}`, submissionData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/api/submissions/${id}`)
    return response.data
  },
}
