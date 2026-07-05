const db = require("../database/database");

const CLIENT_SORT_COLUMNS = new Set([
  "id",
  "name",
  "phone",
  "email",
  "city",
  "state",
  "status",
  "totalProjects",
  "totalRevenue",
  "pendingAmount",
  "createdAt",
  "updatedAt",
]);

class ClientModel {
  static normalizeSort(sortBy = "createdAt", sortOrder = "DESC") {
    const column = CLIENT_SORT_COLUMNS.has(sortBy) ? sortBy : "createdAt";
    const order = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";
    return { column, order };
  }

  static getAllClients(
    limit = 50,
    offset = 0,
    status = null,
    sortBy = "createdAt",
    sortOrder = "DESC",
    callback
  ) {
    const { column, order } = this.normalizeSort(sortBy, sortOrder);
    let query = "SELECT * FROM clients WHERE 1=1";
    let countQuery = "SELECT COUNT(*) as count FROM clients WHERE 1=1";
    const params = [];
    const countParams = [];

    if (status && status !== "all") {
      query += " AND status = ?";
      countQuery += " AND status = ?";
      params.push(status);
      countParams.push(status);
    }

    query += ` ORDER BY ${column} ${order} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(query, params, (err, clients) => {
      if (err) return callback(err);

      db.get(countQuery, countParams, (countErr, countResult) => {
        if (countErr) return callback(countErr);
        callback(null, {
          clients: clients || [],
          total: countResult ? countResult.count : 0,
        });
      });
    });
  }

  static searchClients(searchTerm, callback) {
    const likeTerm = `%${searchTerm}%`;

    db.all(
      `SELECT * FROM clients
       WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR address LIKE ? OR city LIKE ? OR state LIKE ?
       ORDER BY createdAt DESC`,
      [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm],
      callback
    );
  }

  static getClientById(id, callback) {
    db.get("SELECT * FROM clients WHERE id = ?", [id], callback);
  }

  static getClientWithProjects(id, callback) {
    this.getClientById(id, (err, client) => {
      if (err) return callback(err);
      if (!client) return callback(null, null);

      callback(null, { ...client, projects: [] });
    });
  }

  static createClient(data, callback) {
    const {
      name,
      phone,
      email,
      address,
      gst,
      totalProjects = 0,
      totalRevenue = 0,
      pendingAmount = 0,
      status = "Active",
      city,
      state,
      zipCode,
      notes,
    } = data;

    db.run(
      `INSERT INTO clients (
        name, phone, email, address, gst, totalProjects, totalRevenue,
        pendingAmount, status, city, state, zipCode, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        phone,
        email,
        address,
        gst,
        totalProjects,
        totalRevenue,
        pendingAmount,
        status,
        city,
        state,
        zipCode,
        notes,
      ],
      function onInsert(err) {
        if (err) return callback(err);
        ClientModel.getClientById(this.lastID, callback);
      }
    );
  }

  static updateClient(id, data, callback) {
    const {
      name,
      phone,
      email,
      address,
      gst,
      totalProjects,
      totalRevenue,
      pendingAmount,
      status,
      city,
      state,
      zipCode,
      notes,
    } = data;

    db.run(
      `UPDATE clients SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        gst = COALESCE(?, gst),
        totalProjects = COALESCE(?, totalProjects),
        totalRevenue = COALESCE(?, totalRevenue),
        pendingAmount = COALESCE(?, pendingAmount),
        status = COALESCE(?, status),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        zipCode = COALESCE(?, zipCode),
        notes = COALESCE(?, notes),
        updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name,
        phone,
        email,
        address,
        gst,
        totalProjects,
        totalRevenue,
        pendingAmount,
        status,
        city,
        state,
        zipCode,
        notes,
        id,
      ],
      (err) => {
        if (err) return callback(err);
        ClientModel.getClientById(id, callback);
      }
    );
  }

  static updateClientStatus(id, status, callback) {
    db.run(
      "UPDATE clients SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id],
      (err) => {
        if (err) return callback(err);
        ClientModel.getClientById(id, callback);
      }
    );
  }

  static deleteClient(id, callback) {
    db.run("DELETE FROM clients WHERE id = ?", [id], (err) => {
      if (err) return callback(err);
      callback(null, { success: true, id });
    });
  }

  static getClientStats(callback) {
    db.get(
      `SELECT
        COUNT(*) as totalClients,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as activeClients,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactiveClients,
        SUM(CASE WHEN status = 'Potential' THEN 1 ELSE 0 END) as potentialClients,
        SUM(totalRevenue) as totalRevenue,
        SUM(pendingAmount) as pendingAmount
       FROM clients`,
      [],
      callback
    );
  }

  static getClientsByCity(city, callback) {
    db.all(
      "SELECT * FROM clients WHERE city = ? ORDER BY name ASC",
      [city],
      callback
    );
  }

  static getClientsByState(state, callback) {
    db.all(
      "SELECT * FROM clients WHERE state = ? ORDER BY name ASC",
      [state],
      callback
    );
  }
}

module.exports = ClientModel;
