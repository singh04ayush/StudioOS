import api from "./api";

const RESOURCE = "/events";

class EventService {
  static async getAllEvents(limit = 50, offset = 0, projectId = null, status = null, sortBy = "createdAt", sortOrder = "DESC") {
    try {
      const params = { limit, offset, sortBy, sortOrder };
      if (projectId) params.projectId = projectId;
      if (status) params.status = status;

      const response = await api.get(RESOURCE, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  static async searchEvents(searchTerm, projectId = null) {
    try {
      const params = { query: searchTerm };
      if (projectId) params.projectId = projectId;

      const response = await api.get(`${RESOURCE}/search`, { params });
      return response.data;
    } catch (error) {
      console.error("Error searching events:", error);
      throw error;
    }
  }

  static async getEventById(id) {
    try {
      const response = await api.get(`${RESOURCE}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  }

  static async getEventsByProject(projectId) {
    try {
      const response = await api.get(`${RESOURCE}/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching project events:", error);
      throw error;
    }
  }

  static async getEventStats(projectId = null) {
    try {
      const params = {};
      if (projectId) params.projectId = projectId;

      const response = await api.get(`${RESOURCE}/stats`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching event stats:", error);
      throw error;
    }
  }

  static async getEventsByDateRange(startDate, endDate, projectId = null) {
    try {
      const params = { startDate, endDate };
      if (projectId) params.projectId = projectId;

      const response = await api.get(`${RESOURCE}/range`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching events by date range:", error);
      throw error;
    }
  }

  static async createEvent(data) {
    try {
      const response = await api.post(RESOURCE, data);
      return response.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  static async updateEvent(id, data) {
    try {
      const response = await api.put(`${RESOURCE}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  static async updateEventStatus(id, status) {
    try {
      const response = await api.patch(`${RESOURCE}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating event status:", error);
      throw error;
    }
  }

  static async deleteEvent(id) {
    try {
      const response = await api.delete(`${RESOURCE}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }
}

export default EventService;
