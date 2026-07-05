const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/projectController");

// Get project statistics
router.get("/stats/overview", ProjectController.getProjectStats);

// Search projects
router.get("/search/query", ProjectController.searchProjects);

// Get projects by date range
router.get("/range/filter", ProjectController.getProjectsByDateRange);

// Get all projects with filtering and pagination
router.get("/", ProjectController.getAllProjects);

// Get a single project with details
router.get("/:id", ProjectController.getProjectById);

// Create a new project
router.post("/", ProjectController.createProject);

// Update a project
router.put("/:id", ProjectController.updateProject);

// Delete a project
router.delete("/:id", ProjectController.deleteProject);

// Update project status
router.patch("/:id/status", ProjectController.updateProjectStatus);

// Archive a project
router.patch("/:id/archive", ProjectController.archiveProject);

module.exports = router;