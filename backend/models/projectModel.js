const db = require("../database/database");

class ProjectModel {
  /**
   * Get all projects with optional filtering, sorting, and pagination
   */
  static getAllProjects(
    limit = 50,
    offset = 0,
    status = null,
    sortBy = "createdAt",
    sortOrder = "DESC",
    callback
  ) {
    let query = "SELECT * FROM projects WHERE 1=1";
    const params = [];

    if (status && status !== "all") {
      query += " AND status = ?";
      params.push(status);
    }

    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(query, params, callback);
  }

  /**
   * Get project count (for pagination)
   */
  static getProjectCount(status = null, callback) {
    let query = "SELECT COUNT(*) as count FROM projects WHERE 1=1";
    const params = [];

    if (status && status !== "all") {
      query += " AND status = ?";
      params.push(status);
    }

    db.get(query, params, callback);
  }

  /**
   * Search projects by name or client
   */
  static searchProjects(searchTerm, limit = 50, offset = 0, callback) {
    const query = `SELECT * FROM projects 
                   WHERE projectName LIKE ? OR clientName LIKE ? OR email LIKE ?
                   ORDER BY createdAt DESC
                   LIMIT ? OFFSET ?`;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit, offset];

    db.all(query, params, callback);
  }

  /**
   * Get a single project by ID
   */
  static getProjectById(id, callback) {
    db.get("SELECT * FROM projects WHERE id = ?", [id], callback);
  }

  /**
   * Create a new project
   */
  static createProject(projectData, callback) {
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
      balance,
      status = "Upcoming",
      notes = "",
    } = projectData;

    db.run(
      `INSERT INTO projects (
        projectName, clientName, phone, email, address, 
        eventType, location, startDate, endDate, 
        totalAmount, advance, balance, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
        advance,
        balance || totalAmount - advance,
        status,
        notes,
      ],
      function (err) {
        if (err) return callback(err, null);
        callback(null, { id: this.lastID, ...projectData });
      }
    );
  }

  /**
   * Update a project
   */
  static updateProject(id, projectData, callback) {
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
    } = projectData;

    db.run(
      `UPDATE projects SET 
        projectName = ?, clientName = ?, phone = ?, email = ?, address = ?,
        eventType = ?, location = ?, startDate = ?, endDate = ?,
        totalAmount = ?, status = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
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
        id,
      ],
      (err) => {
        if (err) return callback(err, null);
        
        // Recalculate balance based on new total amount
        db.run(
          `UPDATE projects 
           SET balance = totalAmount - advance
           WHERE id = ?`,
          [id],
          () => {
            callback(null, { id, ...projectData });
          }
        );
      }
    );
  }

  /**
   * Delete a project
   */
  static deleteProject(id, callback) {
    // Delete related records first
    db.run("DELETE FROM payments WHERE projectId = ?", [id], () => {
      db.run("DELETE FROM events WHERE projectId = ?", [id], () => {
        db.run("DELETE FROM editing_tasks WHERE projectId = ?", [id], () => {
          db.run("DELETE FROM deliveries WHERE projectId = ?", [id], () => {
            db.run("DELETE FROM notes WHERE projectId = ?", [id], () => {
              db.run("DELETE FROM timeline WHERE projectId = ?", [id], () => {
                db.run("DELETE FROM projects WHERE id = ?", [id], (err) => {
                  if (err) return callback(err, null);
                  callback(null, { success: true, id });
                });
              });
            });
          });
        });
      });
    });
  }

  /**
   * Get projects by status
   */
  static getProjectsByStatus(status, callback) {
    db.all(
      "SELECT * FROM projects WHERE status = ? ORDER BY startDate ASC",
      [status],
      callback
    );
  }

  /**
   * Get projects statistics
   */
  static getProjectStats(callback) {
    db.get(
      `SELECT 
        COUNT(*) as totalProjects,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedProjects,
        SUM(CASE WHEN status = 'Ongoing' THEN 1 ELSE 0 END) as ongoingProjects,
        SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END) as upcomingProjects,
        SUM(totalAmount) as totalRevenue,
        SUM(advance) as totalAdvance,
        SUM(balance) as totalPending
       FROM projects`,
      [],
      callback
    );
  }

  /**
   * Get projects by date range
   */
  static getProjectsByDateRange(startDate, endDate, callback) {
    db.all(
      `SELECT * FROM projects 
       WHERE startDate BETWEEN ? AND ? OR endDate BETWEEN ? AND ?
       ORDER BY startDate ASC`,
      [startDate, endDate, startDate, endDate],
      callback
    );
  }

  /**
   * Update project status
   */
  static updateProjectStatus(id, status, callback) {
    db.run(
      "UPDATE projects SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id],
      (err) => {
        if (err) return callback(err, null);
        
        // Add timeline entry
        db.run(
          `INSERT INTO timeline (projectId, action, description)
           VALUES (?, ?, ?)`,
          [id, "Status Updated", `Project status changed to ${status}`],
          () => {
            callback(null, { success: true });
          }
        );
      }
    );
  }

  /**
   * Archive a project
   */
  static archiveProject(id, callback) {
    this.updateProjectStatus(id, "Archived", callback);
  }

  /**
   * Get project with related data
   */
  static getProjectWithDetails(id, callback) {
    db.get("SELECT * FROM projects WHERE id = ?", [id], (err, project) => {
      if (err) return callback(err, null);
      if (!project) return callback(null, null);

      // Fetch related data
      db.all(
        "SELECT * FROM payments WHERE projectId = ? ORDER BY paymentDate DESC",
        [id],
        (payErr, payments) => {
          db.all(
            "SELECT * FROM events WHERE projectId = ? ORDER BY eventDate ASC",
            [id],
            (evErr, events) => {
              db.all(
                "SELECT * FROM notes WHERE projectId = ? ORDER BY createdAt DESC",
                [id],
                (notErr, notes) => {
                  project.payments = payments || [];
                  project.events = events || [];
                  project.notes = notes || [];
                  callback(null, project);
                }
              );
            }
          );
        }
      );
    });
  }
}

module.exports = ProjectModel;
