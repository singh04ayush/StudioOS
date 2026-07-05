const express = require("express");
const EventController = require("../controllers/eventController");

const router = express.Router();

// GET /api/events/stats - Get event statistics
router.get("/stats", EventController.getEventStats);

// GET /api/events/search - Search events
router.get("/search", EventController.searchEvents);

// GET /api/events/range - Get events by date range
router.get("/range", EventController.getEventsByDateRange);

// GET /api/events - Get all events
router.get("/", EventController.getAllEvents);

// GET /api/events/project/:projectId - Get events for project
router.get("/project/:projectId", EventController.getEventsByProject);

// GET /api/events/:id - Get single event
router.get("/:id", EventController.getEventById);

// POST /api/events - Create new event
router.post("/", EventController.createEvent);

// PUT /api/events/:id - Update event
router.put("/:id", EventController.updateEvent);

// PATCH /api/events/:id/status - Update event status
router.patch("/:id/status", EventController.updateEventStatus);

// DELETE /api/events/:id - Delete event
router.delete("/:id", EventController.deleteEvent);

module.exports = router;
