import axios from "axios";

const API_URL = "http://localhost:5000/api/projects";

class ProjectService {
  /**
   * Get all projects with filtering and pagination
   */
  static async getAllProjects(limit = 50, offset = 0, status = null, sortBy = "createdAt", sortOrder = "DESC") {
    try {
      const response = await axios.get(API_URL, {
        params: { limit, offset, status, sortBy, sortOrder },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  /**
   * Search projects
   */
  static async searchProjects(searchTerm, limit = 50, offset = 0) {
    try {
      const response = await axios.get(`${API_URL}/search/query`, {
        params: { q: searchTerm, limit, offset },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching projects:", error);
      throw error;
    }
  }

  /**
   * Get a single project with details
   */
  static async getProjectById(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching project:", error);
      throw error;
    }
  }

  /**
   * Get project statistics
   */
  static async getProjectStats() {
    try {
      const response = await axios.get(`${API_URL}/stats/overview`);
      return response.data;
    } catch (error) {
      console.error("Error fetching project stats:", error);
      throw error;
    }
  }

  /**
   * Get projects by date range
   */
  static async getProjectsByDateRange(startDate, endDate) {
    try {
      const response = await axios.get(`${API_URL}/range/filter`, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching projects by date range:", error);
      throw error;
    }
  }

  /**
   * Create a new project
   */
  static async createProject(projectData) {
    try {
      const response = await axios.post(API_URL, projectData);
      return response.data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  /**
   * Update a project
   */
  static async updateProject(id, projectData) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }

  /**
   * Update project status
   */
  static async updateProjectStatus(id, status) {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating project status:", error);
      throw error;
    }
  }

  /**
   * Archive a project
   */
  static async archiveProject(id) {
    try {
      const response = await axios.patch(`${API_URL}/${id}/archive`);
      return response.data;
    } catch (error) {
      console.error("Error archiving project:", error);
      throw error;
    }
  }
}

export default ProjectService;