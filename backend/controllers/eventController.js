const EventModel = require("../models/eventModel");

class EventController {
  static getAllEvents(req, res) {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const projectId = req.query.projectId || null;
    const status = req.query.status || null;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = (req.query.sortOrder || "DESC").toUpperCase();

    if (!["ASC", "DESC"].includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sort order. Use ASC or DESC.",
      });
    }

    EventModel.getAllEvents(
      limit,
      offset,
      projectId,
      status,
      sortBy,
      sortOrder,
      (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }

        res.json({
          success: true,
          data: result.events,
          pagination: {
            total: result.total,
            limit,
            offset,
          },
        });
      }
    );
  }

  static searchEvents(req, res) {
    const { query, projectId } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Search query must be at least 2 characters",
      });
    }

    EventModel.searchEvents(query, projectId || null, (err, events) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: events || [],
      });
    });
  }

  static getEventById(req, res) {
    const { id } = req.params;

    EventModel.getEventById(id, (err, event) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!event) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }

      res.json({
        success: true,
        data: event,
      });
    });
  }

  static getEventsByProject(req, res) {
    const { projectId } = req.params;

    EventModel.getEventsByProject(projectId, (err, events) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: events || [],
      });
    });
  }

  static getEventStats(req, res) {
    const { projectId } = req.query;

    EventModel.getEventStats(projectId || null, (err, stats) => {
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

  static getEventsByDateRange(req, res) {
    const { startDate, endDate, projectId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Start date and end date are required",
      });
    }

    EventModel.getEventsByDateRange(
      startDate,
      endDate,
      projectId || null,
      (err, events) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }

        res.json({
          success: true,
          data: events || [],
        });
      }
    );
  }

  static createEvent(req, res) {
    const { projectId, eventName, eventType, eventDate } = req.body;

    if (!projectId || !eventName || !eventType || !eventDate) {
      return res.status(400).json({
        success: false,
        error: "Project ID, event name, event type, and event date are required",
      });
    }

    EventModel.createEvent(req.body, (err, event) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: event,
      });
    });
  }

  static updateEvent(req, res) {
    const { id } = req.params;

    EventModel.getEventById(id, (findErr, event) => {
      if (findErr) {
        return res.status(500).json({
          success: false,
          error: findErr.message,
        });
      }

      if (!event) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }

      EventModel.updateEvent(id, req.body, (err, updatedEvent) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }

        res.json({
          success: true,
          message: "Event updated successfully",
          data: updatedEvent,
        });
      });
    });
  }

  static updateEventStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    EventModel.getEventById(id, (findErr, event) => {
      if (findErr) {
        return res.status(500).json({
          success: false,
          error: findErr.message,
        });
      }

      if (!event) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }

      EventModel.updateEventStatus(id, status, (err, updatedEvent) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }

        res.json({
          success: true,
          message: "Event status updated successfully",
          data: updatedEvent,
        });
      });
    });
  }

  static deleteEvent(req, res) {
    const { id } = req.params;

    EventModel.getEventById(id, (findErr, event) => {
      if (findErr) {
        return res.status(500).json({
          success: false,
          error: findErr.message,
        });
      }

      if (!event) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }

      EventModel.deleteEvent(id, (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }

        res.json({
          success: true,
          message: "Event deleted successfully",
          data: result,
        });
      });
    });
  }
}

module.exports = EventController;
