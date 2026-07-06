import { useEffect, useMemo, useState } from "react";
import {
  Plus, Trash2, Edit2, Wallet, AlertCircle,
  CheckCircle2, TrendingUp, DollarSign, X,
} from "lucide-react";
import PaymentService from "../../services/paymentService";
import ProjectService  from "../../services/projectService";

const MODE_BADGE = {
  UPI:           "badge badge-blue",
  Cash:          "badge badge-green",
  "Bank Transfer":"badge badge-purple",
  Cheque:        "badge badge-yellow",
  Card:          "badge badge-cyan",
};

const BLANK_FORM = {
  projectId: "", amount: "",
  paymentDate: new Date().toISOString().split("T")[0],
  paymentMode: "UPI", remarks: "", referenceNumber: "",
};

export default function Payments() {
  const [payments,  setPayments]  = useState([]);
  const [stats,     setStats]     = useState(null);
  const [projects,  setProjects]  = useState([]);
  const [pending,   setPending]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData,  setFormData]  = useState(BLANK_FORM);

  useEffect(() => {
    fetchPayments(); fetchStats(); fetchProjects(); fetchPending();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await PaymentService.getAllPayments();
      setPayments(res.data || []); setError(null);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchStats    = async () => {
    try { const r = await PaymentService.getPaymentStats(); setStats(r.data?.overview || r.data || null); }
    catch (e) { console.error(e); }
  };
  const fetchProjects = async () => {
    try { const r = await ProjectService.getAllProjects(100, 0); setProjects(r.data || []); }
    catch (e) { console.error(e); }
  };
  const fetchPending  = async () => {
    try { const r = await PaymentService.getPendingPayments(); setPending(r.data || []); }
    catch (e) { console.error(e); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectId || !formData.amount) { alert("Project and amount are required"); return; }
    try {
      editingId
        ? await PaymentService.updatePayment(editingId, formData)
        : await PaymentService.createPayment(formData);
      resetForm();
      await Promise.all([fetchPayments(), fetchStats(), fetchPending()]);
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleEdit = (p) => {
    setFormData({ projectId: p.projectId, amount: p.amount, paymentDate: p.paymentDate,
      paymentMode: p.paymentMode, remarks: p.remarks, referenceNumber: p.referenceNumber });
    setEditingId(p._id || p.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this payment?")) return;
    try { await PaymentService.deletePayment(id); await Promise.all([fetchPayments(), fetchStats(), fetchPending()]); }
    catch (err) { alert("Error: " + err.message); }
  };

  const resetForm = () => { setFormData(BLANK_FORM); setEditingId(null); setShowForm(false); };

  const summary = useMemo(() => ({
    count:          Number(stats?.totalPayments || 0),
    total:          Number(stats?.totalAmount   || 0),
    average:        Number(stats?.averageAmount || 0),
    pendingAmount:  pending.reduce((s, i) => s + Number(i.balance || 0), 0),
  }), [stats, pending]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track receipts, pending balances and payment history</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); resetForm(); }}>
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Close" : "Record Payment"}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Payments",  value: summary.count,                  color:"blue",   icon: Wallet },
          { label:"Collected",       value: `₹${summary.total.toLocaleString()}`,   color:"green",  icon: CheckCircle2 },
          { label:"Average Payment", value: `₹${summary.average.toLocaleString()}`, color:"cyan",   icon: TrendingUp },
          { label:"Pending Balance", value: `₹${summary.pendingAmount.toLocaleString()}`, color:"yellow", icon: AlertCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className="stat-label">
              {label}
              <div className={`stat-icon ${color}`}><Icon size={14} /></div>
            </div>
            <div className="stat-value" style={{ color:{blue:"#60a5fa",green:"#4ade80",cyan:"#22d3ee",yellow:"#facc15"}[color] }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-header">
            <span className="card-title">{editingId ? "Edit Payment" : "Record New Payment"}</span>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}><X size={13} /> Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, marginBottom:16 }}>
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select className="form-select" name="projectId" value={formData.projectId} onChange={handleInputChange} required>
                  <option value="">Select project…</option>
                  {projects.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.projectName} — {p.clientName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount *</label>
                <input className="form-input" type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="Enter amount" required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Date *</label>
                <input className="form-input" type="date" name="paymentDate" value={formData.paymentDate} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select className="form-select" name="paymentMode" value={formData.paymentMode} onChange={handleInputChange}>
                  {["Cash","UPI","Bank Transfer","Cheque","Card"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reference / Transaction ID</label>
                <input className="form-input" type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleInputChange} placeholder="Transaction reference" />
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input className="form-input" type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} placeholder="Optional notes" />
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button type="submit" className="btn btn-primary">{editingId ? "Update" : "Record Payment"}</button>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:12, padding:"12px 16px", color:"#f87171", marginBottom:16, fontSize:13 }}>
          {error}
        </div>
      )}

      {/* Main content grid */}
      <div className="content-grid">

        {/* Payments table */}
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <div className="card-header" style={{ padding:"20px 24px 16px" }}>
            <span className="card-title"><Wallet size={16} style={{ color:"#60a5fa" }} /> Recent Payments</span>
            <span style={{ fontSize:12, color:"var(--text-muted)" }}>{payments.length} entries</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign:"center", padding:"32px 16px", color:"var(--text-muted)" }}>Loading…</td></tr>
                ) : payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p._id || p.id}>
                      <td>
                        <div style={{ fontWeight:600, fontSize:14 }}>{p.projectName || "Project"}</div>
                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>{p.clientName || ""}</div>
                      </td>
                      <td style={{ color:"#4ade80", fontWeight:700 }}>₹{Number(p.amount).toLocaleString()}</td>
                      <td style={{ color:"var(--text-secondary)", fontSize:13 }}>{p.paymentDate}</td>
                      <td><span className={MODE_BADGE[p.paymentMode] || "badge badge-gray"}>{p.paymentMode}</span></td>
                      <td>
                        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                          <button onClick={() => handleEdit(p)} title="Edit" style={{ color:"#60a5fa", background:"none", border:"none", cursor:"pointer", padding:4 }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(p._id || p.id)} title="Delete" style={{ color:"#f87171", background:"none", border:"none", cursor:"pointer", padding:4 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state"><DollarSign size={32} /><p>No payments recorded yet</p></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Pending Payments */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <AlertCircle size={16} style={{ color:"#facc15" }} /> Pending Payments
              </span>
              {pending.length > 0 && (
                <span className="badge badge-yellow">{pending.length} open</span>
              )}
            </div>
            <div className="list-items">
              {pending.length > 0 ? (
                pending.map((item) => (
                  <div key={item._id || item.id} className="list-item">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14 }}>{item.projectName || "Project"}</div>
                        <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{item.clientName || ""}</div>
                      </div>
                      <span style={{ color:"#facc15", fontWeight:700, fontSize:15 }}>
                        ₹{Number(item.balance || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ padding:"20px 0" }}>
                  <CheckCircle2 size={24} style={{ color:"#4ade80", opacity:0.6, margin:"0 auto 8px" }} />
                  <p style={{ fontSize:13 }}>All balances settled</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Health */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <CheckCircle2 size={16} style={{ color:"#4ade80" }} /> Payment Health
              </span>
            </div>
            <div className="list-items">
              {[
                { label:"Collection Status", value:"Healthy",           color:"#4ade80" },
                { label:"Payment Modes",     value:"UPI / Cash / Bank", color:"var(--text-primary)" },
                { label:"Trend",             value:"Positive",          color:"#60a5fa", icon: TrendingUp },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="list-item" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, color:"var(--text-secondary)" }}>{label}</span>
                  <span style={{ fontSize:13, fontWeight:600, color, display:"flex", alignItems:"center", gap:6 }}>
                    {Icon && <Icon size={13} />}{value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
