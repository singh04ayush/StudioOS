import { useState, useEffect } from "react";
import {
  TrendingUp, Clock, AlertCircle, Users,
  DollarSign, FileText, ArrowRight,
} from "lucide-react";
import DashboardService from "../../services/dashboardService";

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-label">
        {label}
        <div className={`stat-icon ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className={`stat-value`} style={{ color: colorValue(color) }}>
        {value}
      </div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function colorValue(c) {
  return { blue: "#60a5fa", green: "#4ade80", yellow: "#facc15", purple: "#c084fc", cyan: "#22d3ee" }[c] || "#f0f4fc";
}

function EmptyRow({ msg }) {
  return (
    <div className="empty-state">
      <p style={{ fontSize: 13 }}>{msg}</p>
    </div>
  );
}

function statusBadge(status) {
  const map = {
    Completed: "badge badge-green",
    Ongoing:   "badge badge-blue",
    Upcoming:  "badge badge-yellow",
    Archived:  "badge badge-gray",
  };
  return map[status] || "badge badge-gray";
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await DashboardService.getDashboardOverview();
      setOverview(data);
      setError(null);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Clock size={18} style={{ opacity: 0.5, animation: "spin 1s linear infinite" }} />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  const s = overview?.stats || {};
  const proj = s.projects  || {};
  const pay  = s.payments  || {};
  const cli  = s.clients   || {};
  const evt  = s.events    || {};

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard 📊</h1>
        <p className="page-subtitle">Welcome back to StudioOS</p>
      </div>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 12,
          padding: "12px 16px",
          color: "#f87171",
          marginBottom: 24,
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="stats-grid">
        <StatCard
          label="Total Projects"
          value={proj.totalProjects ?? 0}
          sub={`${proj.completedProjects ?? 0} completed`}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${((proj.totalRevenue ?? 0) / 100000).toFixed(1)}L`}
          sub={`₹${((pay.totalAmount ?? 0) / 100000).toFixed(1)}L collected`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label="Pending Amount"
          value={`₹${((proj.totalPending ?? 0) / 100000).toFixed(1)}L`}
          sub={`${(pay.totalPayments ?? 0)} payments`}
          icon={AlertCircle}
          color="yellow"
        />
        <StatCard
          label="Active Clients"
          value={cli.activeClients ?? 0}
          sub={`${cli.totalClients ?? 0} total`}
          icon={Users}
          color="purple"
        />
        <StatCard
          label="Upcoming Events"
          value={evt.scheduledEvents ?? 0}
          sub={`${evt.totalEvents ?? 0} total events`}
          icon={Clock}
          color="cyan"
        />
      </div>

      {/* Content grid — top row */}
      <div className="content-grid">

        {/* Recent Projects */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <TrendingUp size={16} style={{ color: "#60a5fa" }} />
              Recent Projects
            </span>
            <a href="/projects" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={12} />
            </a>
          </div>

          <div className="list-items">
            {overview?.recentProjects?.length > 0 ? (
              overview.recentProjects.map((p, i) => (
                <div key={p._id || p.id || i} className="list-item">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.projectName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.clientName}</div>
                    </div>
                    <span className={statusBadge(p.status)}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, display: "flex", gap: 16 }}>
                    <span>₹{((p.totalAmount || 0) / 100000).toFixed(2)}L</span>
                    <span>{p.eventType}</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyRow msg="No projects yet" />
            )}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <AlertCircle size={16} style={{ color: "#facc15" }} />
              Pending Payments
            </span>
          </div>

          <div className="list-items">
            {overview?.pendingPayments?.length > 0 ? (
              overview.pendingPayments.map((p, i) => (
                <div key={p._id || p.id || i} className="list-item">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.projectName || "Project"}</div>
                    <span style={{ color: "#facc15", fontWeight: 700, fontSize: 14 }}>
                      ₹{((p.balance || 0) / 100000).toFixed(2)}L
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                    {p.clientName}
                  </div>
                </div>
              ))
            ) : (
              <EmptyRow msg="All payments collected ✅" />
            )}
          </div>
        </div>

      </div>

      {/* Bottom grid */}
      <div className="content-grid">

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Clock size={16} style={{ color: "#22d3ee" }} />
              Upcoming Events
            </span>
            <a href="/calendar" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={12} />
            </a>
          </div>

          <div className="list-items">
            {overview?.upcomingEvents?.length > 0 ? (
              overview.upcomingEvents.map((e, i) => (
                <div key={e._id || e.id || i} className="list-item">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{e.eventName}</div>
                    <span className="badge badge-cyan">{e.eventType}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, display: "flex", gap: 14 }}>
                    <span>📍 {e.venue || e.location || "—"}</span>
                    <span>📅 {e.eventDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyRow msg="No upcoming events" />
            )}
          </div>
        </div>

        {/* Active Clients */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Users size={16} style={{ color: "#c084fc" }} />
              Active Clients
            </span>
            <a href="/clients" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={12} />
            </a>
          </div>

          <div className="list-items">
            {overview?.activeClients?.length > 0 ? (
              overview.activeClients.slice(0, 5).map((c, i) => (
                <div key={c._id || c.id || i} className="list-item">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "linear-gradient(135deg,#a855f7,#6366f1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>
                      {(c.name || c.clientName || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name || c.clientName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.email}</div>
                    </div>
                    <span className="badge badge-green" style={{ marginLeft: "auto" }}>Active</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyRow msg="No active clients" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}