import api from "./api"

export const projectService = {
  async getAll() {
    const response = await api.get("/api/projects")
    return Array.isArray(response.data) ? response.data : response.data.projects || []
  },

  async getById(id) {
    const response = await api.get(`/api/projects/${id}`)
    return response.data.project || response.data
  },

  async create(projectData) {
    const response = await api.post("/api/projects", projectData)
    return response.data
  },

  async update(id, projectData) {
    const response = await api.put(`/api/projects/${id}`, projectData)
    return response.data.project || response.data
  },

  async delete(id) {
    const response = await api.delete(`/api/projects/${id}`)
    return response.data
  },

  async getCriteria(projectId) {
    const response = await api.get(`/api/projects/${projectId}/criteria`)
    return response.data.criteria || response.data || []
  },

  async createCriterion(projectId, criterionData) {
    const response = await api.post(`/api/projects/${projectId}/criteria`, criterionData)
    return response.data.criteria || response.data
  },
}
