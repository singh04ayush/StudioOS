const express = require("express");
const ClientController = require("../controllers/clientController");

const router = express.Router();

// GET /api/clients/stats - Get client statistics
router.get("/stats", ClientController.getClientStats);

// GET /api/clients/search - Search clients
router.get("/search", ClientController.searchClients);

// GET /api/clients/city/:city - Get clients by city
router.get("/city/:city", ClientController.getClientsByCity);

// GET /api/clients/state/:state - Get clients by state
router.get("/state/:state", ClientController.getClientsByState);

// GET /api/clients - Get all clients
router.get("/", ClientController.getAllClients);

// GET /api/clients/:id/projects - Get client with projects
router.get("/:id/projects", ClientController.getClientWithProjects);

// GET /api/clients/:id - Get single client
router.get("/:id", ClientController.getClientById);

// POST /api/clients - Create new client
router.post("/", ClientController.createClient);

// PUT /api/clients/:id - Update client
router.put("/:id", ClientController.updateClient);

// PATCH /api/clients/:id/status - Update client status
router.patch("/:id/status", ClientController.updateClientStatus);

// DELETE /api/clients/:id - Delete client
router.delete("/:id", ClientController.deleteClient);

module.exports = router;
