import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search, FolderOpen, DollarSign, Clock, CheckCircle, X } from "lucide-react";
import ProjectService from "../../services/projectService";
import { useNavigate } from "react-router-dom";

const STATUS_BADGE = {
  Completed: "badge badge-green",
  Ongoing:   "badge badge-blue",
  Upcoming:  "badge badge-yellow",
  Archived:  "badge badge-gray",
};

const BLANK_FORM = {
  projectName: "", clientName: "", phone: "", email: "", address: "",
  eventType: "Wedding", location: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "", totalAmount: "", advance: 0, status: "Upcoming", notes: "",
};

export default function Projects() {
  const navigate = useNavigate();
  const [projects,     setProjects]     = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [showForm,     setShowForm]     = useState(false);
  const [editingId,    setEditingId]    = useState(null);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy,       setSortBy]       = useState("createdAt");
  const [sortOrder,    setSortOrder]    = useState("DESC");
  const [formData,     setFormData]     = useState(BLANK_FORM);

  useEffect(() => { fetchProjects(); fetchStats(); }, [filterStatus, sortBy, sortOrder]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await ProjectService.getAllProjects(50, 0, filterStatus !== "all" ? filterStatus : null, sortBy, sortOrder);
      setProjects(res.data || []);
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try { const res = await ProjectService.getProjectStats(); setStats(res.data); }
    catch (err) { console.error(err); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim().length < 2) return;
    try {
      setLoading(true);
      const res = await ProjectService.searchProjects(searchTerm);
      setProjects(res.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectName || !formData.clientName || !formData.totalAmount) {
      alert("Project name, client name, and total amount are required"); return;
    }
    try {
      editingId
        ? await ProjectService.updateProject(editingId, formData)
        : await ProjectService.createProject(formData);
      resetForm(); setShowForm(false); fetchProjects(); fetchStats();
    } catch (err) { alert("Error saving project: " + err.message); }
  };

  const handleEdit = (p) => {
    setFormData({ projectName: p.projectName, clientName: p.clientName, phone: p.phone,
      email: p.email, address: p.address, eventType: p.eventType, location: p.location,
      startDate: p.startDate, endDate: p.endDate, totalAmount: p.totalAmount,
      advance: p.advance, status: p.status, notes: p.notes });
    setEditingId(p._id || p.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    try { await ProjectService.deleteProject(id); fetchProjects(); fetchStats(); }
    catch (err) { alert("Error: " + err.message); }
  };

  const resetForm = () => { setFormData(BLANK_FORM); setEditingId(null); };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage all your photography projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); resetForm(); }}>
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Close" : "New Project"}
        </button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(5,1fr)", marginBottom: 24 }}>
          {[
            { label: "Total",     value: stats.totalProjects     || 0, color: "blue",   icon: FolderOpen },
            { label: "Completed", value: stats.completedProjects || 0, color: "green",  icon: CheckCircle },
            { label: "Ongoing",   value: stats.ongoingProjects   || 0, color: "cyan",   icon: Clock },
            { label: "Revenue",   value: `₹${Number(stats.totalRevenue||0).toLocaleString()}`,  color: "purple", icon: DollarSign },
            { label: "Pending",   value: `₹${Number(stats.totalPending||0).toLocaleString()}`,  color: "yellow", icon: DollarSign },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className={`stat-card ${color}`}>
              <div className="stat-label">
                {label}
                <div className={`stat-icon ${color}`}><Icon size={14} /></div>
              </div>
              <div className="stat-value" style={{ color: { blue:"#60a5fa",green:"#4ade80",cyan:"#22d3ee",purple:"#c084fc",yellow:"#facc15" }[color] }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-input-wrap" style={{ maxWidth: 400, flex: 1 }}>
          <Search size={14} className="si" />
          <input
            placeholder="Search projects, clients…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        {searchTerm && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearchTerm(""); fetchProjects(); }}>
            <X size={12} /> Clear
          </button>
        )}
        <button className="btn btn-primary btn-sm" onClick={handleSearch}><Search size={13} /> Search</button>
        <select className="form-select" style={{ width: "auto" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>
        <select className="form-select" style={{ width: "auto" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="startDate">Start Date</option>
          <option value="totalAmount">Amount</option>
          <option value="projectName">Name</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <span className="card-title">{editingId ? "Edit Project" : "Create New Project"}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { resetForm(); setShowForm(false); }}>
              <X size={13} /> Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 16 }}>
              {[
                { label:"Project Name *",  name:"projectName",  type:"text",   ph:"e.g., Sarah's Wedding" },
                { label:"Client Name *",   name:"clientName",   type:"text",   ph:"Client full name" },
                { label:"Phone",           name:"phone",        type:"tel",    ph:"Phone number" },
                { label:"Email",           name:"email",        type:"email",  ph:"Email address" },
                { label:"Location / Venue",name:"location",     type:"text",   ph:"Venue or location" },
                { label:"Address",         name:"address",      type:"text",   ph:"Address" },
                { label:"Start Date",      name:"startDate",    type:"date",   ph:"" },
                { label:"End Date",        name:"endDate",      type:"date",   ph:"" },
                { label:"Total Amount *",  name:"totalAmount",  type:"number", ph:"Total contract amount" },
                { label:"Advance Paid",    name:"advance",      type:"number", ph:"Advance received" },
              ].map(({ label, name, type, ph }) => (
                <div key={name} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} name={name} value={formData[name]} onChange={handleInputChange} placeholder={ph} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select className="form-select" name="eventType" value={formData.eventType} onChange={handleInputChange}>
                  {["Wedding","Reception","Engagement","Birthday","Commercial","Corporate"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                  {["Upcoming","Ongoing","Completed"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Additional notes…" />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn btn-primary">{editingId ? "Update Project" : "Create Project"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { resetForm(); setShowForm(false); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:12, padding:"12px 16px", color:"#f87171", marginBottom:16, fontSize:13 }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign:"center", padding:"32px 16px", color:"var(--text-muted)" }}>Loading…</td></tr>
              ) : projects.length > 0 ? (
                projects.map((p) => (
                  <tr
                    key={p._id || p.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/projects/${p._id || p.id}`)}
                  >
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.projectName}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{p.clientName}</td>
                    <td><span className="badge badge-gray">{p.eventType}</span></td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{p.startDate}</td>
                    <td style={{ color: "#4ade80", fontWeight: 600 }}>₹{Number(p.totalAmount).toLocaleString()}</td>
                    <td><span className={STATUS_BADGE[p.status] || "badge badge-gray"}>{p.status}</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                        <button onClick={() => handleEdit(p)} title="Edit" style={{ color:"#60a5fa", background:"none", border:"none", cursor:"pointer", padding:4 }}>
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(p._id || p.id)} title="Delete" style={{ color:"#f87171", background:"none", border:"none", cursor:"pointer", padding:4 }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state"><FolderOpen size={32} /><p>No projects found</p></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}