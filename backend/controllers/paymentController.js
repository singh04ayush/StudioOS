const PaymentModel = require("../models/paymentModel");

class PaymentController {
  /**
   * Get all payments (with pagination)
   */
  static getAllPayments(req, res) {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    PaymentModel.getAllPayments(limit, offset, (err, payments) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      // Get total count
      PaymentModel.getPaymentCount((countErr, countResult) => {
        if (countErr) {
          return res.status(500).json({
            success: false,
            error: countErr.message,
          });
        }

        res.json({
          success: true,
          data: payments,
          pagination: {
            total: countResult.count,
            limit,
            offset,
          },
        });
      });
    });
  }

  /**
   * Get payments for a specific project
   */
  static getPaymentsByProject(req, res) {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: "Project ID is required",
      });
    }

    PaymentModel.getPaymentsByProject(projectId, (err, payments) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: payments || [],
      });
    });
  }

  /**
   * Get a single payment by ID
   */
  static getPaymentById(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Payment ID is required",
      });
    }

    PaymentModel.getPaymentById(id, (err, payment) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: "Payment not found",
        });
      }

      res.json({
        success: true,
        data: payment,
      });
    });
  }

  /**
   * Get payment statistics
   */
  static getPaymentStats(req, res) {
    PaymentModel.getPaymentStats((err, stats) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      PaymentModel.getPaymentModeStats((modeErr, modeStats) => {
        if (modeErr) {
          return res.status(500).json({
            success: false,
            error: modeErr.message,
          });
        }

        res.json({
          success: true,
          data: {
            overview: stats,
            byMode: modeStats,
          },
        });
      });
    });
  }

  /**
   * Get pending payments
   */
  static getPendingPayments(req, res) {
    PaymentModel.getPendingPayments((err, payments) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: payments || [],
      });
    });
  }

  /**
   * Create a new payment
   */
  static createPayment(req, res) {
    const { projectId, amount, paymentDate, paymentMode, remarks, referenceNumber } = req.body;

    // Validation
    if (!projectId || !amount || !paymentDate) {
      return res.status(400).json({
        success: false,
        error: "Project ID, amount, and payment date are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    const paymentData = {
      projectId,
      amount,
      paymentDate,
      paymentMode: paymentMode || "Cash",
      remarks: remarks || "",
      referenceNumber: referenceNumber || "",
    };

    PaymentModel.createPayment(paymentData, (err, payment) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Payment recorded successfully",
        data: payment,
      });
    });
  }

  /**
   * Update a payment
   */
  static updatePayment(req, res) {
    const { id } = req.params;
    const { amount, paymentDate, paymentMode, remarks, referenceNumber } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Payment ID is required",
      });
    }

    if (!amount || !paymentDate) {
      return res.status(400).json({
        success: false,
        error: "Amount and payment date are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    const paymentData = {
      amount,
      paymentDate,
      paymentMode: paymentMode || "Cash",
      remarks: remarks || "",
      referenceNumber: referenceNumber || "",
    };

    PaymentModel.updatePayment(id, paymentData, (err, payment) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "Payment updated successfully",
        data: payment,
      });
    });
  }

  /**
   * Delete a payment
   */
  static deletePayment(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Payment ID is required",
      });
    }

    PaymentModel.deletePayment(id, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "Payment deleted successfully",
        data: result,
      });
    });
  }

  /**
   * Get payments by date range
   */
  static getPaymentsByDateRange(req, res) {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Start date and end date are required",
      });
    }

    PaymentModel.getPaymentsByDateRange(startDate, endDate, (err, payments) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        data: payments || [],
      });
    });
  }
}

module.exports = PaymentController;
