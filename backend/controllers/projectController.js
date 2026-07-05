const ProjectModel = require("../models/projectModel");

class ProjectController {
  /**
   * Get all projects with filtering and pagination
   */
  static getAllProjects(req, res) {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status || null;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = (req.query.sortOrder || "DESC").toUpperCase();

    // Validate sortOrder
    if (!["ASC", "DESC"].includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sort order. Use ASC or DESC.",
      });
    }

    ProjectModel.getAllProjects(
      limit,
      offset,
      status,
      sortBy,
      sortOrder,
      (err, projects) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }

        ProjectModel.getProjectCount(status, (countErr, countResult) => {
          if (countErr) {
            return res.status(500).json({
              success: false,
              error: countErr.message,
            });
          }

          res.json({
            success: true,
            data: projects,
            pagination: {
              total: countResult.count,
              limit,
              offset,
            },
          });
        });
      }
    );
  }

  /**
   * Search projects
   */
  static searchProjects(req, res) {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Search query must be at least 2 characters",
      });
    }

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    ProjectModel.searchProjects(q, limit, offset, (err, projects) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: projects,
      });
    });
  }

  /**
   * Get a single project
   */
  static getProjectById(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Project ID is required",
      });
    }

    ProjectModel.getProjectWithDetails(id, (err, project) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        });
      }

      res.json({
        success: true,
        data: project,
      });
    });
  }

  /**
   * Get project statistics
   */
  static getProjectStats(req, res) {
    ProjectModel.getProjectStats((err, stats) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: stats,
      });
    });
  }

  /**
   * Create a new project
   */
  static createProject(req, res) {
    const {
      projectName,
      clientName,
      phone,
      email,
      address,
      eventType,
      location,
      startDate,
      endDate,
      totalAmount,
      advance = 0,
      status = "Upcoming",
      notes = "",
    } = req.body;

    // Validation
    if (!projectName || !clientName || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: "Project name, client name, and total amount are required",
      });
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Total amount must be greater than 0",
      });
    }

    const projectData = {
      projectName,
      clientName,
      phone: phone || "",
      email: email || "",
      address: address || "",
      eventType: eventType || "General",
      location: location || "",
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || "",
      totalAmount,
      advance: advance || 0,
      balance: totalAmount - (advance || 0),
      status,
      notes,
    };

    ProjectModel.createProject(projectData, (err, project) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: project,
      });
    });
  }

  /**
   * Update a project
   */
  static updateProject(req, res) {
    const { id } = req.params;
    const {
      projectName,
      clientName,
      phone,
      email,
      address,
      eventType,
      location,
      startDate,
      endDate,
      totalAmount,
      status,
      notes,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Project ID is required",
      });
    }

    if (!projectName || !clientName || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: "Project name, client name, and total amount are required",
      });
    }

    const projectData = {
      projectName,
      clientName,
      phone: phone || "",
      email: email || "",
      address: address || "",
      eventType: eventType || "General",
      location: location || "",
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || "",
      totalAmount,
      status: status || "Upcoming",
      notes: notes || "",
    };

    ProjectModel.updateProject(id, projectData, (err, project) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "Project updated successfully",
        data: project,
      });
    });
  }

  /**
   * Delete a project
   */
  static deleteProject(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Project ID is required",
      });
    }

    ProjectModel.deleteProject(id, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "Project deleted successfully",
        data: result,
      });
    });
  }

  /**
   * Update project status
   */
  static updateProjectStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        error: "Project ID and status are required",
      });
    }

    ProjectModel.updateProjectStatus(id, status, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "Project status updated successfully",
        data: result,
      });
    });
  }

  /**
   * Archive a project
   */
  static archiveProject(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Project ID is required",
      });
    }

    ProjectModel.archiveProject(id, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "Project archived successfully",
        data: result,
      });
    });
  }

  /**
   * Get projects by date range
   */
  static getProjectsByDateRange(req, res) {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Start date and end date are required",
      });
    }

    ProjectModel.getProjectsByDateRange(startDate, endDate, (err, projects) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: projects,
      });
    });
  }
}

module.exports = ProjectController;
