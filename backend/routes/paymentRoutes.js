const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/paymentController");

// Get all payments with pagination
router.get("/", PaymentController.getAllPayments);

// Get payment statistics
router.get("/stats/overview", PaymentController.getPaymentStats);

// Get pending payments
router.get("/pending/list", PaymentController.getPendingPayments);

// Get payments by date range
router.get("/range/filter", PaymentController.getPaymentsByDateRange);

// Get payments for a specific project
router.get("/project/:projectId", PaymentController.getPaymentsByProject);

// Get a single payment by ID
router.get("/:id", PaymentController.getPaymentById);

// Create a new payment
router.post("/", PaymentController.createPayment);

// Update a payment
router.put("/:id", PaymentController.updatePayment);

// Delete a payment
router.delete("/:id", PaymentController.deletePayment);

module.exports = router;