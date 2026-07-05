import axios from "axios";

const API_URL = "http://localhost:5000/api/payments";

class PaymentService {
  /**
   * Get all payments
   */
  static async getAllPayments(limit = 50, offset = 0) {
    try {
      const response = await axios.get(API_URL, {
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
      const response = await axios.get(`${API_URL}/project/${projectId}`);
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
      const response = await axios.get(`${API_URL}/${id}`);
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
      const response = await axios.get(`${API_URL}/stats/overview`);
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
      const response = await axios.get(`${API_URL}/pending/list`);
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
      const response = await axios.get(`${API_URL}/range/filter`, {
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
      const response = await axios.post(API_URL, paymentData);
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
      const response = await axios.put(`${API_URL}/${id}`, paymentData);
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
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  }
}

export default PaymentService;
