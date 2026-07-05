const db = require("../database/database");

class PaymentModel {
  /**
   * Get all payments for a specific project
   */
  static getPaymentsByProject(projectId, callback) {
    db.all(
      `SELECT * FROM payments WHERE projectId = ? ORDER BY paymentDate DESC, id DESC`,
      [projectId],
      callback
    );
  }

  /**
   * Get a single payment by ID
   */
  static getPaymentById(id, callback) {
    db.get(
      `SELECT * FROM payments WHERE id = ?`,
      [id],
      callback
    );
  }

  /**
   * Get all payments (with optional pagination)
   */
  static getAllPayments(limit = 50, offset = 0, callback) {
    db.all(
      `SELECT p.*, pr.projectName, pr.clientName FROM payments p
       LEFT JOIN projects pr ON p.projectId = pr.id
       ORDER BY p.paymentDate DESC, p.id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
      callback
    );
  }

  /**
   * Get total payment count
   */
  static getPaymentCount(callback) {
    db.get(
      `SELECT COUNT(*) as count FROM payments`,
      [],
      callback
    );
  }

  /**
   * Get payment statistics
   */
  static getPaymentStats(callback) {
    db.get(
      `SELECT 
        COUNT(*) as totalPayments,
        SUM(amount) as totalAmount,
        AVG(amount) as averageAmount,
        MIN(amount) as minAmount,
        MAX(amount) as maxAmount
       FROM payments`,
      [],
      callback
    );
  }

  /**
   * Get payments within a date range
   */
  static getPaymentsByDateRange(startDate, endDate, callback) {
    db.all(
      `SELECT * FROM payments 
       WHERE paymentDate BETWEEN ? AND ?
       ORDER BY paymentDate DESC`,
      [startDate, endDate],
      callback
    );
  }

  /**
   * Create a new payment
   */
  static createPayment(paymentData, callback) {
    const {
      projectId,
      amount,
      paymentDate,
      paymentMode,
      remarks,
      referenceNumber,
    } = paymentData;

    db.run(
      `INSERT INTO payments (projectId, amount, paymentDate, paymentMode, remarks, referenceNumber)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, amount, paymentDate, paymentMode, remarks, referenceNumber],
      function (err) {
        if (err) return callback(err, null);

        // Update project advance and balance
        db.run(
          `UPDATE projects 
           SET advance = advance + ?, 
               balance = totalAmount - (advance + ?),
               updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [amount, amount, projectId],
          (updateErr) => {
            if (updateErr) return callback(updateErr, null);

            // Add timeline entry
            db.run(
              `INSERT INTO timeline (projectId, action, description)
               VALUES (?, ?, ?)`,
              [projectId, "Payment Recorded", `₹${amount} received via ${paymentMode}`],
              () => {
                callback(null, { id: this.lastID, ...paymentData });
              }
            );
          }
        );
      }
    );
  }

  /**
   * Update a payment
   */
  static updatePayment(id, paymentData, callback) {
    const { amount, paymentDate, paymentMode, remarks, referenceNumber } = paymentData;

    // Get old payment to calculate difference
    db.get(
      `SELECT projectId, amount FROM payments WHERE id = ?`,
      [id],
      (err, oldPayment) => {
        if (err) return callback(err);

        const amountDifference = amount - oldPayment.amount;

        db.run(
          `UPDATE payments 
           SET amount = ?, paymentDate = ?, paymentMode = ?, remarks = ?, referenceNumber = ?, updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [amount, paymentDate, paymentMode, remarks, referenceNumber, id],
          (updateErr) => {
            if (updateErr) return callback(updateErr);

            // Update project if amount changed
            if (amountDifference !== 0) {
              db.run(
                `UPDATE projects 
                 SET advance = advance + ?,
                     balance = totalAmount - (advance + ?),
                     updatedAt = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [amountDifference, amountDifference, oldPayment.projectId],
                () => {
                  callback(null, { id, ...paymentData });
                }
              );
            } else {
              callback(null, { id, ...paymentData });
            }
          }
        );
      }
    );
  }

  /**
   * Delete a payment
   */
  static deletePayment(id, callback) {
    // Get payment details before deletion
    db.get(
      `SELECT projectId, amount FROM payments WHERE id = ?`,
      [id],
      (err, payment) => {
        if (err) return callback(err);

        db.run(
          `DELETE FROM payments WHERE id = ?`,
          [id],
          (deleteErr) => {
            if (deleteErr) return callback(deleteErr);

            // Revert project advance and balance
            db.run(
              `UPDATE projects 
               SET advance = advance - ?,
                   balance = totalAmount - (advance - ?),
                   updatedAt = CURRENT_TIMESTAMP
               WHERE id = ?`,
              [payment.amount, payment.amount, payment.projectId],
              () => {
                callback(null, { success: true });
              }
            );
          }
        );
      }
    );
  }

  /**
   * Get payment mode distribution
   */
  static getPaymentModeStats(callback) {
    db.all(
      `SELECT paymentMode, COUNT(*) as count, SUM(amount) as totalAmount
       FROM payments
       GROUP BY paymentMode
       ORDER BY totalAmount DESC`,
      [],
      callback
    );
  }

  /**
   * Get pending payments
   */
  static getPendingPayments(callback) {
    db.all(
      `SELECT p.*, p.projectName, p.clientName, p.balance
       FROM projects p
       WHERE p.balance > 0
       ORDER BY p.updatedAt DESC`,
      [],
      callback
    );
  }
}

module.exports = PaymentModel;
