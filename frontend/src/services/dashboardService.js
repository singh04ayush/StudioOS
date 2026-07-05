import ProjectService from "./projectService";
import PaymentService from "./paymentService";
import ClientService from "./clientService";
import EventService from "./eventService";

class DashboardService {
  static async getDashboardStats() {
    try {
      const [projectStats, paymentStats, clientStats, eventStats] = await Promise.all([
        ProjectService.getProjectStats().catch(() => ({})),
        PaymentService.getPaymentStats().catch(() => ({})),
        ClientService.getClientStats().catch(() => ({})),
        EventService.getEventStats().catch(() => ({})),
      ]);

      return {
        projects: projectStats.data || {},
        payments: paymentStats.data || {},
        clients: clientStats.data || {},
        events: eventStats.data || {},
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  static async getRecentProjects(limit = 5) {
    try {
      const response = await ProjectService.getAllProjects(limit, 0, null, "createdAt", "DESC");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching recent projects:", error);
      return [];
    }
  }

  static async getPendingPayments() {
    try {
      const response = await PaymentService.getPendingPayments();
      return response.data || [];
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      return [];
    }
  }

  static async getUpcomingEvents(limit = 5) {
    try {
      const response = await EventService.getAllEvents(
        limit,
        0,
        null,
        "Scheduled",
        "eventDate",
        "ASC"
      );
      return response.data || [];
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return [];
    }
  }

  static async getActiveClients() {
    try {
      const response = await ClientService.getAllClients(50, 0, "Active", "clientName", "ASC");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching active clients:", error);
      return [];
    }
  }

  static async getDashboardOverview() {
    try {
      const [stats, recentProjects, pendingPayments, upcomingEvents, activeClients] =
        await Promise.all([
          DashboardService.getDashboardStats(),
          DashboardService.getRecentProjects(),
          DashboardService.getPendingPayments(),
          DashboardService.getUpcomingEvents(),
          DashboardService.getActiveClients(),
        ]);

      return {
        stats,
        recentProjects,
        pendingPayments,
        upcomingEvents,
        activeClients,
      };
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      throw error;
    }
  }
}

export default DashboardService;
