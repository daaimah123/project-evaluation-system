import api from "./api"

export const projectService = {
  async getAll() {
    const response = await api.get("/api/projects")
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/api/projects/${id}`)
    return response.data
  },

  async create(projectData) {
    const response = await api.post("/api/projects", projectData)
    return response.data
  },

  async update(id, projectData) {
    const response = await api.put(`/api/projects/${id}`, projectData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/api/projects/${id}`)
    return response.data
  },

  async getCriteria(projectId) {
    const response = await api.get(`/api/projects/${projectId}/criteria`)
    return response.data
  },

  async createCriterion(projectId, criterionData) {
    const response = await api.post(`/api/projects/${projectId}/criteria`, criterionData)
    return response.data
  },
}
