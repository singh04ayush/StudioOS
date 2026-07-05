import axios from "axios";

const API_URL = "http://localhost:5000/api/clients";

class ClientService {
  static async getAllClients(limit = 50, offset = 0, status = null, sortBy = "createdAt", sortOrder = "DESC") {
    try {
      const params = { limit, offset, sortBy, sortOrder };
      if (status) params.status = status;

      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  }

  static async searchClients(searchTerm) {
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: { query: searchTerm },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching clients:", error);
      throw error;
    }
  }

  static async getClientById(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching client:", error);
      throw error;
    }
  }

  static async getClientWithProjects(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}/projects`);
      return response.data;
    } catch (error) {
      console.error("Error fetching client with projects:", error);
      throw error;
    }
  }

  static async getClientStats() {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching client stats:", error);
      throw error;
    }
  }

  static async getClientsByCity(city) {
    try {
      const response = await axios.get(`${API_URL}/city/${city}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching clients by city:", error);
      throw error;
    }
  }

  static async getClientsByState(state) {
    try {
      const response = await axios.get(`${API_URL}/state/${state}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching clients by state:", error);
      throw error;
    }
  }

  static async createClient(data) {
    try {
      const response = await axios.post(API_URL, data);
      return response.data;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }

  static async updateClient(id, data) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  }

  static async updateClientStatus(id, status) {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating client status:", error);
      throw error;
    }
  }

  static async deleteClient(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  }
}

export default ClientService;
