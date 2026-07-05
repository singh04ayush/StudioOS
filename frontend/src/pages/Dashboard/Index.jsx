import { useState, useEffect } from "react";
import { TrendingUp, Clock, AlertCircle, Users, DollarSign, FileText } from "lucide-react";
import DashboardService from "../../services/dashboardService";

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await DashboardService.getDashboardOverview();
      setOverview(data);
      setError(null);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  const stats = overview?.stats || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Dashboard 📊</h1>
        <p className="text-gray-400 mt-2">Welcome back to StudioOS</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-5 gap-4">
        {/* Total Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400 text-sm">Total Projects</div>
            <FileText size={24} className="text-blue-400" />
          </div>
          <div className="text-3xl font-bold">{stats.projects?.totalProjects || 0}</div>
          <div className="text-gray-500 text-xs mt-2">
            {stats.projects?.completedProjects || 0} completed
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400 text-sm">Total Revenue</div>
            <DollarSign size={24} className="text-green-400" />
          </div>
          <div className="text-3xl font-bold">₹{((stats.projects?.totalRevenue || 0) / 100000).toFixed(1)}L</div>
          <div className="text-gray-500 text-xs mt-2">
            ₹{((stats.payments?.totalPayments || 0) / 100000).toFixed(1)}L collected
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400 text-sm">Pending Amount</div>
            <AlertCircle size={24} className="text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            ₹{((stats.payments?.pendingAmount || 0) / 100000).toFixed(1)}L
          </div>
          <div className="text-gray-500 text-xs mt-2">
            {stats.payments?.pendingPayments || 0} pending
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400 text-sm">Active Clients</div>
            <Users size={24} className="text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-400">{stats.clients?.activeClients || 0}</div>
          <div className="text-gray-500 text-xs mt-2">
            {stats.clients?.totalClients || 0} total
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400 text-sm">Upcoming Events</div>
            <Clock size={24} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-cyan-400">{stats.events?.scheduledEvents || 0}</div>
          <div className="text-gray-500 text-xs mt-2">
            {stats.events?.totalEvents || 0} total events
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-400" />
            Recent Projects
          </h2>
          <div className="space-y-3">
            {overview?.recentProjects?.length > 0 ? (
              overview.recentProjects.map((project) => (
                <div key={project.id} className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{project.projectName}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      project.status === "Completed" ? "bg-green-600/20 text-green-400" :
                      project.status === "In Progress" ? "bg-blue-600/20 text-blue-400" :
                      "bg-gray-600/20 text-gray-400"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>{project.clientName}</p>
                    <p className="mt-1">₹{(project.totalAmount / 100000).toFixed(2)}L • {project.eventType}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">No projects yet</p>
            )}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-yellow-400" />
            Pending Payments
          </h2>
          <div className="space-y-3">
            {overview?.pendingPayments?.length > 0 ? (
              overview.pendingPayments.map((payment) => (
                <div key={payment.id} className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">
                      {payment.projectName || "Project"}
                    </h3>
                    <span className="text-yellow-400 font-bold">₹{(payment.amount / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Mode: {payment.paymentMode}</p>
                    <p className="mt-1">Due: {new Date(payment.dueDate || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">All payments collected! ✅</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock size={20} className="text-cyan-400" />
            Upcoming Events
          </h2>
          <div className="space-y-3">
            {overview?.upcomingEvents?.length > 0 ? (
              overview.upcomingEvents.map((event) => (
                <div key={event.id} className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{event.eventName}</h3>
                    <span className="text-cyan-400 text-xs font-semibold">{event.eventType}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>📍 {event.location}</p>
                    <p className="mt-1">📅 {new Date(event.eventDate).toLocaleDateString()} at {event.startTime}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users size={20} className="text-purple-400" />
            Active Clients
          </h2>
          <div className="space-y-3">
            {overview?.activeClients?.length > 0 ? (
              overview.activeClients.slice(0, 5).map((client) => (
                <div key={client.id} className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{client.clientName}</h3>
                    <span className="text-purple-400 text-xs">Active</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>📧 {client.email}</p>
                    <p className="mt-1">📱 {client.phone}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">No active clients</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}