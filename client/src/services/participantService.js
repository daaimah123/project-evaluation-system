import api from "./api"

export const participantService = {
  async getAll() {
    const response = await api.get("/api/participants")
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/api/participants/${id}`)
    return response.data
  },

  async create(participantData) {
    const response = await api.post("/api/participants", participantData)
    return response.data
  },

  async update(id, participantData) {
    const response = await api.put(`/api/participants/${id}`, participantData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/api/participants/${id}`)
    return response.data
  },
}
