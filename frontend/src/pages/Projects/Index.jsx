import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search, Filter } from "lucide-react";
import ProjectService from "../../services/projectService";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
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
    projectName: "",
    clientName: "",
    phone: "",
    email: "",
    address: "",
    eventType: "Wedding",
    location: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    totalAmount: "",
    advance: 0,
    status: "Upcoming",
    notes: "",
  });

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [filterStatus, sortBy, sortOrder]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await ProjectService.getAllProjects(
        50,
        0,
        filterStatus !== "all" ? filterStatus : null,
        sortBy,
        sortOrder
      );
      setProjects(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ProjectService.getProjectStats();
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
      const response = await ProjectService.searchProjects(searchTerm);
      setProjects(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchProjects();
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

    if (!formData.projectName || !formData.clientName || !formData.totalAmount) {
      alert("Project name, client name, and total amount are required");
      return;
    }

    try {
      if (editingId) {
        await ProjectService.updateProject(editingId, formData);
      } else {
        await ProjectService.createProject(formData);
      }

      resetForm();
      setShowForm(false);
      fetchProjects();
      fetchStats();
    } catch (err) {
      alert("Error saving project: " + err.message);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      projectName: project.projectName,
      clientName: project.clientName,
      phone: project.phone,
      email: project.email,
      address: project.address,
      eventType: project.eventType,
      location: project.location,
      startDate: project.startDate,
      endDate: project.endDate,
      totalAmount: project.totalAmount,
      advance: project.advance,
      status: project.status,
      notes: project.notes,
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await ProjectService.deleteProject(id);
        fetchProjects();
        fetchStats();
      } catch (err) {
        alert("Error deleting project: " + err.message);
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/projects/${id}`);
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      clientName: "",
      phone: "",
      email: "",
      address: "",
      eventType: "Wedding",
      location: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      totalAmount: "",
      advance: 0,
      status: "Upcoming",
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
        <p className="text-gray-400">Loading projects...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-600/20 text-green-400";
      case "Ongoing":
        return "bg-blue-600/20 text-blue-400";
      case "Upcoming":
        return "bg-yellow-600/20 text-yellow-400";
      case "Archived":
        return "bg-gray-600/20 text-gray-400";
      default:
        return "bg-gray-600/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Projects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 transition"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Total Projects</div>
            <div className="text-3xl font-bold">{stats.totalProjects || 0}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Completed</div>
            <div className="text-3xl font-bold text-green-400">{stats.completedProjects || 0}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Ongoing</div>
            <div className="text-3xl font-bold text-blue-400">{stats.ongoingProjects || 0}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-green-400">
              ₹{stats.totalRevenue ? Number(stats.totalRevenue).toLocaleString() : 0}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-gray-400 text-sm mb-2">Pending</div>
            <div className="text-3xl font-bold text-red-400">
              ₹{stats.totalPending ? Number(stats.totalPending).toLocaleString() : 0}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search projects, clients..."
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
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-600"
        >
          <option value="createdAt">Newest</option>
          <option value="startDate">Start Date</option>
          <option value="totalAmount">Amount</option>
          <option value="projectName">Name</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? "Edit Project" : "Create New Project"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Project Name *</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="e.g., Sarah's Wedding"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Client name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Event Type</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                >
                  <option>Wedding</option>
                  <option>Reception</option>
                  <option>Engagement</option>
                  <option>Birthday</option>
                  <option>Commercial</option>
                  <option>Corporate</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Venue/Location"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Total Amount *</label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleInputChange}
                  placeholder="Total amount"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Advance</label>
                <input
                  type="number"
                  name="advance"
                  value={formData.advance}
                  onChange={handleInputChange}
                  placeholder="Advance amount"
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
                  <option>Upcoming</option>
                  <option>Ongoing</option>
                  <option>Completed</option>
                </select>
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
                {editingId ? "Update Project" : "Create Project"}
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

      {/* Projects Table */}
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
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Project</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Client</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => handleViewDetails(project.id)}
                  >
                    <td className="px-6 py-4 text-white font-semibold">{project.projectName}</td>
                    <td className="px-6 py-4 text-gray-300">{project.clientName}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{project.eventType}</td>
                    <td className="px-6 py-4 text-gray-400">{project.startDate}</td>
                    <td className="px-6 py-4 text-green-400 font-semibold">
                      ₹{Number(project.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 flex gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEdit(project)}
                        className="text-blue-400 hover:text-blue-300 transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
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
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    No projects found
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