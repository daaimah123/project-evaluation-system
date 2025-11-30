import api from "./api"

export const participantService = {
  async getAll() {
    console.log("participantService.getAll called")
    try {
      const response = await api.get("/api/participants")
      console.log("participantService.getAll response:", response.data)
      const data = Array.isArray(response.data) ? response.data : response.data.participants || []
      return data
    } catch (error) {
      console.error("participantService.getAll error:", error)
      throw error
    }
  },

  async getById(id) {
    console.log("participantService.getById called with:", id)
    try {
      const response = await api.get(`/api/participants/${id}`)
      console.log("participantService.getById response:", response.data)
      return response.data.participant || response.data
    } catch (error) {
      console.error("participantService.getById error:", error)
      throw error
    }
  },

  async create(participantData) {
    console.log("participantService.create called with:", participantData)
    try {
      const response = await api.post("/api/participants", participantData)
      console.log("participantService.create response:", response.data)
      return response.data.participant || response.data
    } catch (error) {
      console.error("participantService.create error:", error)
      throw error
    }
  },

  async update(id, participantData) {
    console.log("participantService.update called with:", id, participantData)
    try {
      const response = await api.put(`/api/participants/${id}`, participantData)
      console.log("participantService.update response:", response.data)
      return response.data.participant || response.data
    } catch (error) {
      console.error("participantService.update error:", error)
      throw error
    }
  },

  async delete(id) {
    console.log("participantService.delete called with:", id)
    try {
      const response = await api.delete(`/api/participants/${id}`)
      console.log("participantService.delete response:", response.data)
      return response.data
    } catch (error) {
      console.error("participantService.delete error:", error)
      throw error
    }
  },
}
