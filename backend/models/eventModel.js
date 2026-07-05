const db = require("../database/database");

const EVENT_SORT_COLUMNS = new Set([
  "id",
  "projectId",
  "eventName",
  "eventType",
  "eventDate",
  "startTime",
  "endTime",
  "venue",
  "status",
  "assignedTeam",
  "createdAt",
  "updatedAt",
]);

class EventModel {
  static normalizeSort(sortBy = "createdAt", sortOrder = "DESC") {
    const column = EVENT_SORT_COLUMNS.has(sortBy) ? sortBy : "createdAt";
    const order = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";
    return { column, order };
  }

  static getAllEvents(
    limit = 50,
    offset = 0,
    projectId = null,
    status = null,
    sortBy = "createdAt",
    sortOrder = "DESC",
    callback
  ) {
    const { column, order } = this.normalizeSort(sortBy, sortOrder);
    let query = "SELECT * FROM events WHERE 1=1";
    let countQuery = "SELECT COUNT(*) as count FROM events WHERE 1=1";
    const params = [];
    const countParams = [];

    if (projectId) {
      query += " AND projectId = ?";
      countQuery += " AND projectId = ?";
      params.push(projectId);
      countParams.push(projectId);
    }

    if (status) {
      query += " AND status = ?";
      countQuery += " AND status = ?";
      params.push(status);
      countParams.push(status);
    }

    query += ` ORDER BY ${column} ${order} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(query, params, (err, events) => {
      if (err) return callback(err);

      db.get(countQuery, countParams, (countErr, countResult) => {
        if (countErr) return callback(countErr);
        callback(null, {
          events: events || [],
          total: countResult ? countResult.count : 0,
        });
      });
    });
  }

  static searchEvents(searchTerm, projectId = null, callback) {
    let query = `
      SELECT * FROM events
      WHERE (eventName LIKE ? OR venue LIKE ? OR assignedTeam LIKE ? OR notes LIKE ?)
    `;
    const likeTerm = `%${searchTerm}%`;
    const params = [likeTerm, likeTerm, likeTerm, likeTerm];

    if (projectId) {
      query += " AND projectId = ?";
      params.push(projectId);
    }

    query += " ORDER BY createdAt DESC";
    db.all(query, params, callback);
  }

  static getEventById(id, callback) {
    db.get("SELECT * FROM events WHERE id = ?", [id], callback);
  }

  static getEventsByProject(projectId, callback) {
    db.all(
      "SELECT * FROM events WHERE projectId = ? ORDER BY eventDate ASC",
      [projectId],
      callback
    );
  }

  static createEvent(data, callback) {
    const {
      projectId,
      eventName,
      eventType,
      eventDate,
      startTime,
      endTime,
      venue,
      mapsLink,
      status,
      assignedTeam,
      equipmentRequired,
      notes,
    } = data;

    db.run(
      `INSERT INTO events (
        projectId, eventName, eventType, eventDate, startTime, endTime,
        venue, mapsLink, status, assignedTeam, equipmentRequired, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        eventName,
        eventType,
        eventDate,
        startTime,
        endTime,
        venue,
        mapsLink,
        status || "Scheduled",
        assignedTeam,
        equipmentRequired,
        notes,
      ],
      function onInsert(err) {
        if (err) return callback(err);
        EventModel.getEventById(this.lastID, callback);
      }
    );
  }

  static updateEvent(id, data, callback) {
    const {
      eventName,
      eventType,
      eventDate,
      startTime,
      endTime,
      venue,
      mapsLink,
      status,
      assignedTeam,
      equipmentRequired,
      notes,
    } = data;

    db.run(
      `UPDATE events SET
        eventName = COALESCE(?, eventName),
        eventType = COALESCE(?, eventType),
        eventDate = COALESCE(?, eventDate),
        startTime = COALESCE(?, startTime),
        endTime = COALESCE(?, endTime),
        venue = COALESCE(?, venue),
        mapsLink = COALESCE(?, mapsLink),
        status = COALESCE(?, status),
        assignedTeam = COALESCE(?, assignedTeam),
        equipmentRequired = COALESCE(?, equipmentRequired),
        notes = COALESCE(?, notes),
        updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        eventName,
        eventType,
        eventDate,
        startTime,
        endTime,
        venue,
        mapsLink,
        status,
        assignedTeam,
        equipmentRequired,
        notes,
        id,
      ],
      (err) => {
        if (err) return callback(err);
        EventModel.getEventById(id, callback);
      }
    );
  }

  static updateEventStatus(id, status, callback) {
    db.run(
      "UPDATE events SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id],
      (err) => {
        if (err) return callback(err);
        EventModel.getEventById(id, callback);
      }
    );
  }

  static deleteEvent(id, callback) {
    db.run("DELETE FROM events WHERE id = ?", [id], (err) => {
      if (err) return callback(err);
      callback(null, { success: true, id });
    });
  }

  static getEventsByDateRange(startDate, endDate, projectId = null, callback) {
    let query = "SELECT * FROM events WHERE eventDate BETWEEN ? AND ?";
    const params = [startDate, endDate];

    if (projectId) {
      query += " AND projectId = ?";
      params.push(projectId);
    }

    query += " ORDER BY eventDate ASC";
    db.all(query, params, callback);
  }

  static getEventStats(projectId = null, callback) {
    let query = `
      SELECT
        COUNT(*) as totalEvents,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduledEvents,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedEvents,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelledEvents,
        SUM(CASE WHEN eventDate >= date('now') THEN 1 ELSE 0 END) as upcomingEvents
      FROM events
    `;
    const params = [];

    if (projectId) {
      query += " WHERE projectId = ?";
      params.push(projectId);
    }

    db.get(query, params, callback);
  }
}

module.exports = EventModel;
