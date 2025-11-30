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
    console.log("projectService.create called with:", projectData)
    try {
      const response = await api.post("/api/projects", projectData)
      console.log("projectService.create response:", response)
      console.log("projectService.create response.data:", response.data)
      return response.data
    } catch (error) {
      console.error("projectService.create error:", error)
      console.error("projectService.create error.response:", error.response?.data)
      throw error
    }
  },

  async update(id, projectData) {
    console.log("projectService.update called with:", id, projectData)
    try {
      const response = await api.put(`/api/projects/${id}`, projectData)
      console.log("projectService.update response:", response)
      console.log("projectService.update response.data:", response.data)
      return response.data.project || response.data
    } catch (error) {
      console.error("projectService.update error:", error)
      console.error("projectService.update error.response:", error.response?.data)
      throw error
    }
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
    console.log("projectService.createCriterion called with:", projectId, criterionData)
    try {
      const response = await api.post(`/api/projects/${projectId}/criteria`, criterionData)
      console.log("projectService.createCriterion response:", response.data)
      return response.data.criteria || response.data
    } catch (error) {
      console.error("projectService.createCriterion error:", error)
      console.error("projectService.createCriterion error.response:", error.response?.data)
      throw error
    }
  },

  async updateCriterion(projectId, criterionId, criterionData) {
    console.log("projectService.updateCriterion called with:", projectId, criterionId, criterionData)
    try {
      const response = await api.put(`/api/projects/${projectId}/criteria/${criterionId}`, criterionData)
      console.log("projectService.updateCriterion response:", response.data)
      return response.data.criteria || response.data
    } catch (error) {
      console.error("projectService.updateCriterion error:", error)
      console.error("projectService.updateCriterion error.response:", error.response?.data)
      throw error
    }
  },

  async deleteCriterion(projectId, criterionId) {
    const response = await api.delete(`/api/projects/${projectId}/criteria/${criterionId}`)
    return response.data
  },
}
