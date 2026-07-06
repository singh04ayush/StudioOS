import api from "./api";

const RESOURCE = "/payments";

class PaymentService {
  /**
   * Get all payments
   */
  static async getAllPayments(limit = 50, offset = 0) {
    try {
      const response = await api.get(RESOURCE, {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  }

  /**
   * Get payments for a specific project
   */
  static async getPaymentsByProject(projectId) {
    try {
      const response = await api.get(`${RESOURCE}/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching project payments:", error);
      throw error;
    }
  }

  /**
   * Get a single payment
   */
  static async getPaymentById(id) {
    try {
      const response = await api.get(`${RESOURCE}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching payment:", error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats() {
    try {
      const response = await api.get(`${RESOURCE}/stats/overview`);
      return response.data;
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      throw error;
    }
  }

  /**
   * Get pending payments
   */
  static async getPendingPayments() {
    try {
      const response = await api.get(`${RESOURCE}/pending/list`);
      return response.data;
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      throw error;
    }
  }

  /**
   * Get payments by date range
   */
  static async getPaymentsByDateRange(startDate, endDate) {
    try {
      const response = await api.get(`${RESOURCE}/range/filter`, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payments by date range:", error);
      throw error;
    }
  }

  /**
   * Create a new payment
   */
  static async createPayment(paymentData) {
    try {
      const response = await api.post(RESOURCE, paymentData);
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }

  /**
   * Update a payment
   */
  static async updatePayment(id, paymentData) {
    try {
      const response = await api.put(`${RESOURCE}/${id}`, paymentData);
      return response.data;
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  }

  /**
   * Delete a payment
   */
  static async deletePayment(id) {
    try {
      const response = await api.delete(`${RESOURCE}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  }
}

export default PaymentService;
