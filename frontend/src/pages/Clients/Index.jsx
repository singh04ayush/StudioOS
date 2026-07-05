import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search, Mail, Phone, MapPin } from "lucide-react";
import ClientService from "../../services/clientService";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    gstNumber: "",
    status: "Active",
    notes: "",
  });

  useEffect(() => {
    fetchClients();
    fetchStats();
  }, [filterStatus, sortBy, sortOrder]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await ClientService.getAllClients(
        50,
        0,
        filterStatus !== "all" ? filterStatus : null,
        sortBy,
        sortOrder
      );
      setClients(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ClientService.getClientStats();
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim().length < 2) {
      alert("Search term must be at least 2 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await ClientService.searchClients(searchTerm);
      setClients(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchClients();
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

    if (!formData.clientName || !formData.email || !formData.phone) {
      alert("Client name, email, and phone are required");
      return;
    }

    try {
      if (editingId) {
        await ClientService.updateClient(editingId, formData);
      } else {
        await ClientService.createClient(formData);
      }

      resetForm();
      setShowForm(false);
      fetchClients();
      fetchStats();
    } catch (err) {
      alert("Error saving client: " + err.message);
    }
  };

  const handleEdit = (client) => {
    setFormData({
      clientName: client.clientName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode,
      gstNumber: client.gstNumber,
      status: client.status,
      notes: client.notes,
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this client?")) {
      try {
        await ClientService.deleteClient(id);
        fetchClients();
        fetchStats();
      } catch (err) {
        alert("Error deleting client: " + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      gstNumber: "",
      status: "Active",
      notes: "",
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (loading && !showForm) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Loading clients...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-600/20 text-green-400";
      case "Inactive":
        return "bg-gray-600/20 text-gray-400";
      case "Potential":
        return "bg-blue-600/20 text-blue-400";
      default:
        return "bg-gray-600/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Clients</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          New Client
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Total Clients</div>
            <div className="text-3xl font-bold">{stats.totalClients || 0}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Active</div>
            <div className="text-3xl font-bold text-green-400">{stats.activeClients || 0}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Potential</div>
            <div className="text-3xl font-bold text-blue-400">{stats.potentialClients || 0}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Inactive</div>
            <div className="text-3xl font-bold text-gray-400">{stats.inactiveClients || 0}</div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search clients, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Search size={20} />
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </form>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-600"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Potential">Potential</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-600"
        >
          <option value="createdAt">Newest</option>
          <option value="clientName">Name</option>
          <option value="city">City</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? "Edit Client" : "Add New Client"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="Zip code"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  placeholder="GST number (optional)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                >
                  <option>Active</option>
                  <option>Potential</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600 h-24"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
              >
                {editingId ? "Update Client" : "Add Client"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clients Table */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
          Error: {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Client Name</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Phone</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">City</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 text-white font-semibold">{client.clientName}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      {client.email}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      {client.phone}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      {client.city || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-3">
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-blue-400 hover:text-blue-300 transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-400 hover:text-red-300 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No clients found
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
