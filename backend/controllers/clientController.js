const ClientModel = require("../models/clientModel");

function normalizeClientBody(body) {
  return {
    ...body,
    name: body.name || body.clientName,
    gst: body.gst || body.gstNumber,
  };
}

class ClientController {
  static getAllClients(req, res) {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status || null;
    const sortBy = req.query.sortBy === "clientName" ? "name" : req.query.sortBy || "createdAt";
    const sortOrder = (req.query.sortOrder || "DESC").toUpperCase();

    if (!["ASC", "DESC"].includes(sortOrder)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sort order. Use ASC or DESC.",
      });
    }

    ClientModel.getAllClients(limit, offset, status, sortBy, sortOrder, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: result.clients,
        pagination: {
          total: result.total,
          limit,
          offset,
        },
      });
    });
  }

  static searchClients(req, res) {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Search query must be at least 2 characters",
      });
    }

    ClientModel.searchClients(query, (err, clients) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: clients || [],
      });
    });
  }

  static getClientById(req, res) {
    const { id } = req.params;

    ClientModel.getClientById(id, (err, client) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!client) {
        return res.status(404).json({
          success: false,
          error: "Client not found",
        });
      }

      res.json({
        success: true,
        data: client,
      });
    });
  }

  static getClientWithProjects(req, res) {
    const { id } = req.params;

    ClientModel.getClientWithProjects(id, (err, client) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!client) {
        return res.status(404).json({
          success: false,
          error: "Client not found",
        });
      }

      res.json({
        success: true,
        data: client,
      });
    });
  }

  static getClientStats(req, res) {
    ClientModel.getClientStats((err, stats) => {
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

  static getClientsByCity(req, res) {
    const { city } = req.params;

    ClientModel.getClientsByCity(city, (err, clients) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: clients || [],
      });
    });
  }

  static getClientsByState(req, res) {
    const { state } = req.params;

    ClientModel.getClientsByState(state, (err, clients) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: clients || [],
      });
    });
  }

  static createClient(req, res) {
    const clientData = normalizeClientBody(req.body);
    const { name, email, phone } = clientData;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: "Client name, email, and phone are required",
      });
    }

    ClientModel.createClient(clientData, (err, client) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Client created successfully",
        data: client,
      });
    });
  }

  static updateClient(req, res) {
    const { id } = req.params;
    const clientData = normalizeClientBody(req.body);

    ClientModel.getClientById(id, (findErr, client) => {
      if (findErr) {
        return res.status(500).json({
          success: false,
          error: findErr.message,
        });
      }

      if (!client) {
        return res.status(404).json({
          success: false,
          error: "Client not found",
        });
      }

      ClientModel.updateClient(id, clientData, (err, updatedClient) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }

        res.json({
          success: true,
          message: "Client updated successfully",
          data: updatedClient,
        });
      });
    });
  }

  static updateClientStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    ClientModel.getClientById(id, (findErr, client) => {
      if (findErr) {
        return res.status(500).json({
          success: false,
          error: findErr.message,
        });
      }

      if (!client) {
        return res.status(404).json({
          success: false,
          error: "Client not found",
        });
      }

      ClientModel.updateClientStatus(id, status, (err, updatedClient) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }

        res.json({
          success: true,
          message: "Client status updated successfully",
          data: updatedClient,
        });
      });
    });
  }

  static deleteClient(req, res) {
    const { id } = req.params;

    ClientModel.getClientById(id, (findErr, client) => {
      if (findErr) {
        return res.status(500).json({
          success: false,
          error: findErr.message,
        });
      }

      if (!client) {
        return res.status(404).json({
          success: false,
          error: "Client not found",
        });
      }

      ClientModel.deleteClient(id, (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: err.message,
          });
        }

        res.json({
          success: true,
          message: "Client deleted successfully",
          data: result,
        });
      });
    });
  }
}

module.exports = ClientController;
