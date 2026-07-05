import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit2, Wallet, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import PaymentService from "../../services/paymentService";
import ProjectService from "../../services/projectService";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    projectId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "UPI",
    remarks: "",
    referenceNumber: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
    fetchProjects();
    fetchPending();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await PaymentService.getAllPayments();
      setPayments(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await PaymentService.getPaymentStats();
      setStats(response.data?.overview || null);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await ProjectService.getAllProjects(100, 0);
      setProjects(response.data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchPending = async () => {
    try {
      const response = await PaymentService.getPendingPayments();
      setPending(response.data || []);
    } catch (err) {
      console.error("Error fetching pending payments:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.projectId || !formData.amount) {
      alert("Project and amount are required");
      return;
    }

    try {
      if (editingId) {
        await PaymentService.updatePayment(editingId, formData);
      } else {
        await PaymentService.createPayment(formData);
      }

      resetForm();
      await Promise.all([fetchPayments(), fetchStats(), fetchPending()]);
    } catch (err) {
      alert("Error saving payment: " + err.message);
    }
  };

  const handleEdit = (payment) => {
    setFormData({
      projectId: payment.projectId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMode: payment.paymentMode,
      remarks: payment.remarks,
      referenceNumber: payment.referenceNumber,
    });
    setEditingId(payment.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      try {
        await PaymentService.deletePayment(id);
        await Promise.all([fetchPayments(), fetchStats(), fetchPending()]);
      } catch (err) {
        alert("Error deleting payment: " + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: "",
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMode: "UPI",
      remarks: "",
      referenceNumber: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const summary = useMemo(() => {
    const total = Number(stats?.totalAmount || 0);
    const average = Number(stats?.averageAmount || 0);
    const pendingAmount = pending.reduce((sum, item) => sum + Number(item.balance || 0), 0);

    return {
      total,
      average,
      pendingAmount,
      count: Number(stats?.totalPayments || 0),
    };
  }, [stats, pending]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-400">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="mt-2 text-gray-400">Track receipts, pending balances, and payment history.</p>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          {showForm ? "Close" : "Record Payment"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-gray-400">Total Payments</p>
          <p className="mt-2 text-2xl font-semibold text-white">{summary.count}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-gray-400">Collected</p>
          <p className="mt-2 text-2xl font-semibold text-green-400">₹{summary.total.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-gray-400">Average</p>
          <p className="mt-2 text-2xl font-semibold text-blue-400">₹{summary.average.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-gray-400">Pending Balance</p>
          <p className="mt-2 text-2xl font-semibold text-yellow-400">₹{summary.pendingAmount.toLocaleString()}</p>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="mb-6 text-2xl font-semibold">{editingId ? "Edit Payment" : "Record New Payment"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-400">Project *</label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600"
                  required
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName} — {project.clientName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Payment Date *</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Payment Mode</label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600"
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Cheque</option>
                  <option>Card</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Reference Number</label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleInputChange}
                  placeholder="Transaction ID"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Add notes"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="rounded-lg bg-blue-600 px-6 py-3 transition hover:bg-blue-700">
                {editingId ? "Update Payment" : "Record Payment"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-lg bg-slate-700 px-6 py-3 transition hover:bg-slate-600">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Payments</h2>
            <span className="text-sm text-gray-400">{payments.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800 text-left text-sm text-gray-400">
                <tr>
                  <th className="px-3 py-3">Project</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Mode</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-800/50">
                      <td className="px-3 py-4">
                        <p className="font-medium text-white">{payment.projectName || `Project ${payment.projectId}`}</p>
                        <p className="text-sm text-gray-400">{payment.clientName || ""}</p>
                      </td>
                      <td className="px-3 py-4 font-semibold text-green-400">₹{Number(payment.amount).toLocaleString()}</td>
                      <td className="px-3 py-4 text-gray-300">{payment.paymentDate}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-blue-600/20 px-3 py-1 text-sm text-blue-400">{payment.paymentMode}</span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-3">
                          <button onClick={() => handleEdit(payment)} className="text-blue-400 transition hover:text-blue-300" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(payment.id)} className="text-red-400 transition hover:text-red-300" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 py-8 text-center text-gray-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <AlertCircle size={18} className="text-yellow-400" />
              <h2 className="text-xl font-semibold">Pending Payments</h2>
            </div>
            <div className="space-y-3">
              {pending.length > 0 ? (
                pending.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">{item.projectName || `Project ${item.id}`}</p>
                        <p className="text-sm text-gray-400">{item.clientName || "Client pending"}</p>
                      </div>
                      <span className="text-sm font-semibold text-yellow-400">₹{Number(item.balance || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-center text-sm text-gray-400">
                  All balances are settled.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-green-400" />
              <h2 className="text-xl font-semibold">Payment Health</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-gray-400">Collection Status</span>
                <span className="font-semibold text-green-400">Healthy</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-gray-400">Mode Mix</span>
                <span className="font-semibold text-white">UPI / Cash / Bank</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-gray-400">Trend</span>
                <span className="flex items-center gap-2 font-semibold text-blue-400"><TrendingUp size={16} /> Positive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
