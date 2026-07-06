import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search, Users, Mail, Phone, MapPin, X } from "lucide-react";
import ClientService from "../../services/clientService";

const STATUS_BADGE = {
  Active:    "badge badge-green",
  Potential: "badge badge-blue",
  Inactive:  "badge badge-gray",
};

const BLANK_FORM = {
  clientName: "", email: "", phone: "", address: "",
  city: "", state: "", zipCode: "", gstNumber: "", status: "Active", notes: "",
};

export default function Clients() {
  const [clients,      setClients]      = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [showForm,     setShowForm]     = useState(false);
  const [editingId,    setEditingId]    = useState(null);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy,       setSortBy]       = useState("createdAt");
  const [formData,     setFormData]     = useState(BLANK_FORM);

  useEffect(() => { fetchClients(); fetchStats(); }, [filterStatus, sortBy]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await ClientService.getAllClients(50, 0, filterStatus !== "all" ? filterStatus : null, sortBy, "DESC");
      setClients(res.data || []);
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try { const res = await ClientService.getClientStats(); setStats(res.data); }
    catch (err) { console.error(err); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim().length < 2) return;
    try {
      setLoading(true);
      const res = await ClientService.searchClients(searchTerm);
      setClients(res.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.email || !formData.phone) {
      alert("Name, email, and phone are required"); return;
    }
    try {
      editingId
        ? await ClientService.updateClient(editingId, formData)
        : await ClientService.createClient(formData);
      resetForm(); setShowForm(false); fetchClients(); fetchStats();
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleEdit = (c) => {
    setFormData({ clientName: c.clientName, email: c.email, phone: c.phone,
      address: c.address, city: c.city, state: c.state, zipCode: c.zipCode,
      gstNumber: c.gstNumber, status: c.status, notes: c.notes });
    setEditingId(c._id || c.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this client?")) return;
    try { await ClientService.deleteClient(id); fetchClients(); fetchStats(); }
    catch (err) { alert("Error: " + err.message); }
  };

  const resetForm = () => { setFormData(BLANK_FORM); setEditingId(null); };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client relationships</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); resetForm(); }}>
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Close" : "New Client"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          {[
            { label:"Total Clients", value: stats.totalClients  || 0, color:"blue",   icon: Users },
            { label:"Active",        value: stats.activeClients || 0, color:"green",  icon: Users },
            { label:"Potential",     value: stats.potentialClients || 0, color:"cyan", icon: Users },
            { label:"Inactive",      value: stats.inactiveClients || 0, color:"gray",  icon: Users },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className={`stat-card ${color}`}>
              <div className="stat-label">
                {label}
                <div className={`stat-icon ${color}`}><Icon size={14} /></div>
              </div>
              <div className="stat-value" style={{ color: {blue:"#60a5fa",green:"#4ade80",cyan:"#22d3ee",gray:"#94a3b8"}[color] }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-input-wrap" style={{ maxWidth:400, flex:1 }}>
          <Search size={14} className="si" />
          <input
            placeholder="Search clients, email, phone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        {searchTerm && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearchTerm(""); fetchClients(); }}>
            <X size={12} /> Clear
          </button>
        )}
        <button className="btn btn-primary btn-sm" onClick={handleSearch}><Search size={13} /> Search</button>
        <select className="form-select" style={{ width:"auto" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Potential">Potential</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select className="form-select" style={{ width:"auto" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="clientName">Name A–Z</option>
          <option value="city">City</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-header">
            <span className="card-title">{editingId ? "Edit Client" : "Add New Client"}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { resetForm(); setShowForm(false); }}>
              <X size={13} /> Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:16 }}>
              {[
                { label:"Client Name *", name:"clientName", type:"text",  ph:"Full name" },
                { label:"Email *",       name:"email",      type:"email", ph:"Email address" },
                { label:"Phone *",       name:"phone",      type:"tel",   ph:"Phone number" },
                { label:"Address",       name:"address",    type:"text",  ph:"Street address" },
                { label:"City",          name:"city",       type:"text",  ph:"City" },
                { label:"State",         name:"state",      type:"text",  ph:"State" },
                { label:"Zip Code",      name:"zipCode",    type:"text",  ph:"Zip / PIN code" },
                { label:"GST Number",    name:"gstNumber",  type:"text",  ph:"GST (optional)" },
              ].map(({ label, name, type, ph }) => (
                <div key={name} className="form-group">
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} name={name} value={formData[name]} onChange={handleInputChange} placeholder={ph} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                  {["Active","Potential","Inactive"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom:20 }}>
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Additional notes…" />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button type="submit" className="btn btn-primary">{editingId ? "Update Client" : "Add Client"}</button>
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
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign:"center", padding:"32px 16px", color:"var(--text-muted)" }}>Loading…</td></tr>
              ) : clients.length > 0 ? (
                clients.map((c) => (
                  <tr key={c._id || c.id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#a855f7,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, flexShrink:0 }}>
                          {(c.clientName||"?")[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight:600 }}>{c.clientName}</span>
                      </div>
                    </td>
                    <td style={{ color:"var(--text-secondary)", fontSize:13 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <Mail size={13} style={{ color:"var(--text-muted)", flexShrink:0 }} />{c.email}
                      </div>
                    </td>
                    <td style={{ color:"var(--text-secondary)", fontSize:13 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <Phone size={13} style={{ color:"var(--text-muted)", flexShrink:0 }} />{c.phone}
                      </div>
                    </td>
                    <td style={{ color:"var(--text-muted)", fontSize:13 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <MapPin size={13} style={{ color:"var(--text-muted)", flexShrink:0 }} />{c.city || "—"}
                      </div>
                    </td>
                    <td><span className={STATUS_BADGE[c.status] || "badge badge-gray"}>{c.status}</span></td>
                    <td>
                      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                        <button onClick={() => handleEdit(c)} title="Edit" style={{ color:"#60a5fa", background:"none", border:"none", cursor:"pointer", padding:4 }}>
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(c._id || c.id)} title="Delete" style={{ color:"#f87171", background:"none", border:"none", cursor:"pointer", padding:4 }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state"><Users size={32} /><p>No clients found</p></div>
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
