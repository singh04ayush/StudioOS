import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit2, Search, Clock, MapPin, User, CalendarDays, Sparkles } from "lucide-react";
import EventService from "../../services/eventService";
import { useParams } from "react-router-dom";

export default function Events() {
  const { projectId } = useParams();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("eventDate");
  const [sortOrder, setSortOrder] = useState("ASC");

  const [formData, setFormData] = useState({
    projectId: projectId || "",
    eventName: "",
    eventType: "Photography",
    eventDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    location: "",
    description: "",
    assignedTo: "",
    status: "Scheduled",
    notes: "",
  });

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [filterStatus, sortBy, sortOrder, projectId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let response;

      if (projectId) {
        response = await EventService.getEventsByProject(projectId);
      } else {
        response = await EventService.getAllEvents(
          50,
          0,
          null,
          filterStatus !== "all" ? filterStatus : null,
          sortBy,
          sortOrder
        );
      }

      setEvents(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await EventService.getEventStats(projectId || null);
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
      const response = await EventService.searchEvents(searchTerm, projectId || null);
      setEvents(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchEvents();
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

    if (!formData.projectId || !formData.eventName || !formData.eventDate) {
      alert("Project ID, event name, and event date are required");
      return;
    }

    try {
      if (editingId) {
        await EventService.updateEvent(editingId, formData);
      } else {
        await EventService.createEvent(formData);
      }

      resetForm();
      setShowForm(false);
      await Promise.all([fetchEvents(), fetchStats()]);
    } catch (err) {
      alert("Error saving event: " + err.message);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      projectId: event.projectId,
      eventName: event.eventName,
      eventType: event.eventType,
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      description: event.description,
      assignedTo: event.assignedTo,
      status: event.status,
      notes: event.notes,
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await EventService.deleteEvent(id);
        await Promise.all([fetchEvents(), fetchStats()]);
      } catch (err) {
        alert("Error deleting event: " + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: projectId || "",
      eventName: "",
      eventType: "Photography",
      eventDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
      location: "",
      description: "",
      assignedTo: "",
      status: "Scheduled",
      notes: "",
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((event) => event.status !== "Completed" && event.status !== "Cancelled")
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
      .slice(0, 4);
  }, [events]);

  if (loading && !showForm) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-400">Loading events...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-600/20 text-green-400";
      case "Scheduled":
        return "bg-blue-600/20 text-blue-400";
      case "In Progress":
        return "bg-yellow-600/20 text-yellow-400";
      case "Cancelled":
        return "bg-red-600/20 text-red-400";
      default:
        return "bg-gray-600/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="mt-2 text-gray-400">Plan shoots, manage schedules, and keep teams aligned.</p>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          {showForm ? "Close" : "New Event"}
        </button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-sm text-gray-400">Total Events</div>
            <div className="mt-2 text-3xl font-bold">{stats.totalEvents || 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-sm text-gray-400">Scheduled</div>
            <div className="mt-2 text-3xl font-bold text-blue-400">{stats.scheduledEvents || 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-sm text-gray-400">Completed</div>
            <div className="mt-2 text-3xl font-bold text-green-400">{stats.completedEvents || 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-sm text-gray-400">Upcoming</div>
            <div className="mt-2 text-3xl font-bold text-yellow-400">{stats.upcomingEvents || 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-sm text-gray-400">Cancelled</div>
            <div className="mt-2 text-3xl font-bold text-red-400">{stats.cancelledEvents || 0}</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search events, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-w-[220px] flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-600"
          />
          <button type="submit" className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 transition hover:bg-blue-700">
            <Search size={18} />
            Search
          </button>
          {searchTerm && (
            <button type="button" onClick={handleClearSearch} className="rounded-lg bg-slate-700 px-6 py-3 transition hover:bg-slate-600">
              Clear
            </button>
          )}
        </form>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-600">
          <option value="all">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-600">
          <option value="eventDate">Event Date</option>
          <option value="eventName">Event Name</option>
          <option value="createdAt">Newest</option>
        </select>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="mb-6 text-2xl font-semibold">{editingId ? "Edit Event" : "Create New Event"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-gray-400">Project ID *</label>
                <input type="text" name="projectId" value={formData.projectId} onChange={handleInputChange} placeholder="Project ID" className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600" disabled={!!projectId} required />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Event Name *</label>
                <input type="text" name="eventName" value={formData.eventName} onChange={handleInputChange} placeholder="Event name" className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600" required />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Event Type</label>
                <select name="eventType" value={formData.eventType} onChange={handleInputChange} className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600">
                  <option>Photography</option>
                  <option>Videography</option>
                  <option>Pre-Wedding</option>
                  <option>Reception</option>
                  <option>Ceremony</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Event Date *</label>
                <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600" required />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="Event location" className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Assigned To</label>
                <input type="text" name="assignedTo" value={formData.assignedTo} onChange={handleInputChange} placeholder="Team member name" className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600">
                  <option>Scheduled</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-400">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Event description" className="h-20 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-400">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Additional notes" className="h-20 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-600" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="rounded-lg bg-blue-600 px-6 py-3 transition hover:bg-blue-700">{editingId ? "Update Event" : "Create Event"}</button>
              <button type="button" onClick={handleCancel} className="rounded-lg bg-slate-700 px-6 py-3 transition hover:bg-slate-600">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Schedule Overview</h2>
            <span className="text-sm text-gray-400">{events.length} events</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800 text-left text-sm text-gray-400">
                <tr>
                  <th className="px-3 py-3">Event</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Location</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {events.length > 0 ? (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-800/50">
                      <td className="px-3 py-4">
                        <p className="font-medium text-white">{event.eventName}</p>
                        <p className="text-sm text-gray-400">{event.eventType}</p>
                      </td>
                      <td className="px-3 py-4 text-gray-300">
                        <div className="flex items-center gap-2"><Clock size={14} />{event.eventDate}</div>
                      </td>
                      <td className="px-3 py-4 text-gray-300">
                        <div className="flex items-center gap-2"><MapPin size={14} />{event.location || "-"}</div>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-sm ${getStatusColor(event.status)}`}>{event.status}</span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-3">
                          <button onClick={() => handleEdit(event)} className="text-blue-400 transition hover:text-blue-300" title="Edit"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(event.id)} className="text-red-400 transition hover:text-red-300" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="px-3 py-8 text-center text-gray-400">No events found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <CalendarDays size={18} className="text-blue-400" />
              <h2 className="text-xl font-semibold">Upcoming Shoots</h2>
            </div>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">{event.eventName}</p>
                        <p className="text-sm text-gray-400">{event.eventType}</p>
                      </div>
                      <span className="text-sm font-semibold text-blue-400">{event.eventDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-center text-sm text-gray-400">No upcoming shoots.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles size={18} className="text-purple-400" />
              <h2 className="text-xl font-semibold">Team Focus</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <User size={16} className="text-gray-400" />
                <div>
                  <p className="font-medium text-white">Assigned coverage</p>
                  <p className="text-sm text-gray-400">Keep talent and venue details aligned before each shoot.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
